import { ChatInputCommandInteraction, Colors, EmbedBuilder, PermissionFlagsBits, SlashCommandStringOption, ApplicationCommandOptionBase, AutocompleteInteraction } from "discord.js";
import { updateSetting, defaultSettings } from "../../../util/guild/guildSettings.js";
import { Guardsman } from "index";

async function invalidValueTemplate(interaction: ChatInputCommandInteraction<"cached">, type: string, value: string) {
    await interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(Colors.Red)
                .setTitle("Invalid Value")
                .setDescription(`The value \`${value}\` must be type \`${type}\`.`)
                .setFooter({ text: "Guardsman Settings" })
                .setTimestamp()
        ]
    })
}

async function cleanValue(setting: keyof typeof defaultSettings, value: any, interaction: ChatInputCommandInteraction<"cached">) {
    switch (typeof defaultSettings[setting].default) {
        case "string":
            if (typeof value !== "string") {
                await invalidValueTemplate(interaction, typeof defaultSettings[setting].default, value);
                return;
            }

            return value;
        case "boolean":
            if (value.toLowerCase() !== "true" && value.toLowerCase() !== "false") {
                await invalidValueTemplate(interaction, typeof defaultSettings[setting].default, value);
                return;
            }

            return value.toLowerCase() === "true" ? true : false;
        case "number":
            if (isNaN(Number(value))) {
                await invalidValueTemplate(interaction, typeof defaultSettings[setting].default, value);
                return;
            }

            return Number(value);
        default:
            return;
    }
}

export default class SettingsUpdateCommand implements ICommand {
    name: Lowercase<string> = "update";
    description: string = "Allows Guild managers to update guild settings.";
    guardsman: Guardsman;
    defaultMemberPermissions = PermissionFlagsBits.ManageGuild;

    options: ApplicationCommandOptionBase[] = [
        new SlashCommandStringOption()
            .setName("setting")
            .setDescription("Setting to update")
            .setRequired(true)
            .setAutocomplete(true),

        new SlashCommandStringOption()
            .setName("value")
            .setDescription("Value to set the setting to, if no value is given it will return to default.")
            .setRequired(false)
            .setAutocomplete(true),
    ]

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const setting = interaction.options.getString("setting", true) as keyof typeof defaultSettings;
        const value = interaction.options.getString("value", false);

        if (defaultSettings[setting] === undefined) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setTitle("Invalid Setting")
                        .setDescription(`The setting \`${setting}\` is not a valid setting.`)
                        .setFooter({ text: "Guardsman Settings" })
                        .setTimestamp()
                ]
            })

            return;
        }

        let cleanedValue: typeof defaultSettings[typeof setting]["default"] | undefined;
        if (value) {
            if ((defaultSettings[setting] as { options: string[] }).options) {
                let stringOptions = []

                for (const option of (defaultSettings[setting] as { options: string[] }).options) {
                    stringOptions.push(option.toString());
                }

                if (!stringOptions.includes(value)) {
                    await invalidValueTemplate(interaction, "object", value);
                    return;
                }

                cleanedValue = await cleanValue(setting, value, interaction);
            } else {
                cleanedValue = await cleanValue(setting, value, interaction);
            }
        } else {
            cleanedValue = defaultSettings[setting].default;
        }

        if (!cleanedValue) return;

        await updateSetting(this.guardsman, interaction.guild, setting, cleanedValue);

        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle(`Guardsman Setting - ${setting}`)
            .setDescription(`The value of the setting \`${setting}\` has been updated to \`${cleanedValue}\`.`)
            .setFooter({ text: "Guardsman Settings" })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    async autocomplete(interaction: AutocompleteInteraction<"cached">): Promise<void> {
        const setting = interaction.options.getString("setting", false) as keyof typeof defaultSettings;
        const value = interaction.options.getString("value", false);

        const focusedValue = interaction.options.getFocused(true);
        let choices: string[] = [];

        switch (focusedValue.name) {
            case "setting":
                choices = Object.keys(defaultSettings).filter(settings => settings.toLowerCase().includes(setting.toLowerCase()));

                break;
            case "value":
                if ((defaultSettings[setting] as { options: string[] }).options) {
                    choices = (defaultSettings[setting] as { options: string[] }).options.map(option => option.toString());

                    break;
                }

                switch (typeof defaultSettings[setting].default) {
                    case "boolean":
                        choices = ["true", "false"];

                        break;
                    default:
                        if (typeof value === "string") {
                            if (value?.length === 0) break;

                            choices = [value.slice(0, 100)];
                        }

                        break;
                }

                break;
        }

        await interaction.respond(
            choices ? choices.map(choice => ({ name: choice, value: choice })).slice(0, 24) : []
        );
    }
}