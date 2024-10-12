/**
 *  Copyright (C) 2024 Bunker Bravo Interactive LLC

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.

 */

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