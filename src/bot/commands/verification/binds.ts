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

import {
    ChatInputCommandInteraction,
    Colors,
    EmbedBuilder, PermissionFlagsBits,
} from "discord.js";
import { Guardsman } from "index";

export default class BindsCommand implements ICommand {
    name: Lowercase<string> = "binds";
    description = "Allows guild managers to view the list of role binds for this guild.";
    defaultMemberPermissions = PermissionFlagsBits.ManageRoles;

    guardsman: Guardsman;

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const guild = interaction.guild;

        const bindData = await this.guardsman.database<IRoleBind>("verification_binds")
            .select("*")
            .where("guild_id", guild.id);

        const binds: Array<string> = [];

        for (const bind of bindData) {
            const roleData = JSON.parse(bind.role_data);
            let roleDataString = "";

            for (const index in roleData) {
                const value = roleData[index];

                roleDataString = roleDataString + `**${index.charAt(0).toUpperCase() + index.slice(1)}:** ${value} `;
            }

            binds.push(`**Role:** <@&${bind.role_id}> ${roleDataString}`);
        }

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`Guardsman Role binds for ${guild.name}`)
                    .setDescription(binds.join("\n\n") || "No binds found.")
                    .setColor(Colors.Green)
                    .setTimestamp()
                    .setFooter({ text: "Guardsman Database" }),
            ],
        });
    };
}
