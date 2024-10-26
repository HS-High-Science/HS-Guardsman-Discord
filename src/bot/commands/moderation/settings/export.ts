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
import { getSettings } from "../../../util/guild/guildSettings.js";
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