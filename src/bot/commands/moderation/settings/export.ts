import { ChatInputCommandInteraction, Colors, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { getSettings } from "../../../util/guildSettings.js";
import { Guardsman } from "index";

export default class ExportSettingsGetCommand implements ICommand {
    name: Lowercase<string> = "export";
    description: string = "Allows Guild managers to export guild settings.";
    guardsman: Guardsman;
    defaultMemberPermissions = PermissionFlagsBits.ManageGuild;

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const guildSettings = await getSettings(this.guardsman, interaction.guild);

        await interaction.reply({
            files: [
                {
                    name: `${interaction.guild.name}-settings.json`,
                    attachment: Buffer.from(JSON.stringify(guildSettings, null, 4))
                }
            ], embeds: [
                new EmbedBuilder()
                    .setTitle("Settings Exported")
                    .setColor(Colors.Green)
                    .setDescription("This guilds settings have been exported successfully!")
                    .setFooter({ text: "Guardsman Settings" })
                    .setTimestamp()
            ], ephemeral: true
        });
    }
}