import { ChatInputCommandInteraction, Colors, EmbedBuilder, PermissionFlagsBits, ApplicationCommandOptionBase, SlashCommandAttachmentOption } from "discord.js";
import { defaultSettings } from "../../../util/guild/guildSettings.js";
import { Guardsman } from "index";
import axios from "axios";

export default class ImportSettingsGetCommand implements ICommand {
    name: Lowercase<string> = "import";
    description: string = "Allows Guild managers to import guild settings.";
    guardsman: Guardsman;
    defaultMemberPermissions = PermissionFlagsBits.ManageGuild;

    options: ApplicationCommandOptionBase[] = [
        new SlashCommandAttachmentOption()
            .setName("settings")
            .setDescription("The JSON file containing the settings to import.")
            .setRequired(true),
    ]

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await interaction.deferReply({ ephemeral: true });

        const attachment = interaction.options.getAttachment("settings", true);

        if (!attachment.contentType?.includes("json")) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Invalid File")
                        .setColor(Colors.Red)
                        .setDescription("The file must be a JSON file.")
                        .setFooter({ text: "Guardsman Settings" })
                        .setTimestamp()
                ]
            })

            return;
        }

        try {
            const data = await axios.get(attachment.url, { responseType: "arraybuffer" });
            let settings;

            try {
                settings = JSON.parse(data.data.toString());
            } catch (error) {
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Invalid JSON")
                            .setColor(Colors.Red)
                            .setDescription("The JSON file is invalid.")
                            .setFooter({ text: "Guardsman Settings" })
                            .setTimestamp()
                    ]
                })

                return;
            }

            for (const [key, _] of Object.entries(settings)) {
                if (!Object.keys(defaultSettings).includes(key)) {
                    delete settings[key];
                };
            }

            await this.guardsman.configuration.pushGuildSettings(interaction.guild.id, {
                settings: JSON.stringify(settings)
            });

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Settings Imported")
                        .setColor(Colors.Green)
                        .setDescription("The settings have been imported successfully for this guild!")
                        .setFooter({ text: "Guardsman Settings" })
                        .setTimestamp()
                ]
            });
        } catch (error) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Error Importing Settings")
                        .setColor(Colors.Red)
                        .setDescription("An error occurred while importing the settings for this guild.")
                        .setFooter({ text: "Guardsman Settings" })
                        .setTimestamp()
                ]
            });
        }
    }
}