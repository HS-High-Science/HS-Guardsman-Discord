import { ChatInputCommandInteraction, Colors, EmbedBuilder, PermissionFlagsBits, AutocompleteInteraction, ApplicationCommandOptionBase, SlashCommandStringOption } from "discord.js";
import { defaultSettings } from "../../../util/guild/guildSettings.js";
import { Guardsman } from "index";

export default class AboutSettingsGetCommand implements ICommand {
    name: Lowercase<string> = "about";
    description: string = "Allows Guild managers to learn about guild settings.";
    guardsman: Guardsman;
    defaultMemberPermissions = PermissionFlagsBits.ManageGuild;

    options: ApplicationCommandOptionBase[] = [
        new SlashCommandStringOption()
            .setName("setting")
            .setDescription("Setting to learn about")
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

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle(`Guardsman Setting - ${setting}`)
                    .setDescription(defaultSettings[setting].about)
                    .setFooter({ text: "Guardsman Settings" })
                    .setTimestamp()
            ]
        });
    }

    async autocomplete(interaction: AutocompleteInteraction<"cached">): Promise<void> {
        const query = interaction.options.getString("setting", true);

        const settings = Object.keys(defaultSettings).filter(setting => setting.toLowerCase().includes(query.toLowerCase()));

        await interaction.respond(
            settings ? settings.map(setting => ({ name: setting, value: setting })).slice(0, 24) : []
        );
    }
}