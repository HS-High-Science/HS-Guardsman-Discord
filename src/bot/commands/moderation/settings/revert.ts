import { ChatInputCommandInteraction, Colors, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { Guardsman } from "index";

export default class RevertSettingsGetCommand implements ICommand {
    name: Lowercase<string> = "revert";
    description: string = "Allows Guild managers to revert all guild settings.";
    guardsman: Guardsman;
    defaultMemberPermissions = PermissionFlagsBits.ManageGuild;

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await interaction.deferReply({ ephemeral: true });

        try {
            await this.guardsman.configuration.pushGuildSettings(interaction.guild.id, {
                settings: "{}"
            });

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Settings Reverted")
                        .setColor(Colors.Green)
                        .setDescription("All guild settings have been reverted successfully!")
                        .setFooter({ text: "Guardsman Settings" })
                        .setTimestamp()
                ]
            });
        } catch (error) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Error Reverting Settings")
                        .setColor(Colors.Red)
                        .setDescription("An error occurred while reverting guild settings.")
                        .setFooter({ text: "Guardsman Settings" })
                        .setTimestamp()
                ]
            });

            return;
        }
    }
}