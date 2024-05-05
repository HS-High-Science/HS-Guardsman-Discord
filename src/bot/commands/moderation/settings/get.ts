import { ChatInputCommandInteraction, Colors, EmbedBuilder, PermissionFlagsBits, SlashCommandStringOption, ApplicationCommandOptionBase, AutocompleteInteraction } from "discord.js";
import { Guardsman } from "index";
import { getSettings, defaultSettings } from "../../../util/guildSettings.js";

export default class SettingsGetCommand implements ICommand {
    name: Lowercase<string> = "get";
    description: string = "Allows Guild managers to view guild settings.";
    guardsman: Guardsman;
    defaultMemberPermissions = PermissionFlagsBits.ManageGuild;

    options: ApplicationCommandOptionBase[] = [
        new SlashCommandStringOption()
            .setName("setting")
            .setDescription("Setting to view")
            .setRequired(true)
            .setAutocomplete(true),
    ]

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const setting = interaction.options.getString("setting", true) as keyof typeof defaultSettings;

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

        const value = await getSettings(this.guardsman, interaction.guild).then(settings => settings[setting]);

        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle(`Guardsman Setting - ${setting}`)
            .setDescription(`The value of the setting \`${setting}\` is \`${value}\`.`)
            .setFooter({ text: "Guardsman Settings" })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    async autocomplete(interaction: AutocompleteInteraction<"cached">): Promise<void> {
        const query = interaction.options.getString("setting", true);

        const settings = Object.keys(defaultSettings).filter(setting => setting.includes(query));

        await interaction.respond(
            settings ? settings.map(setting => ({ name: setting, value: setting })).slice(0, 24) : []
        );
    }
}