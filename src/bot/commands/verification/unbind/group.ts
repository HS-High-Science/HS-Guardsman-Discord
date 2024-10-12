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

import { Guardsman } from "index";
import {
    ApplicationCommandOptionBase,
    ChatInputCommandInteraction, Colors, EmbedBuilder,
    SlashCommandNumberOption,
    SlashCommandRoleOption, PermissionFlagsBits
} from "discord.js";

export default class UnbindGroupSubcommand implements ICommand {
    name: Lowercase<string> = "group";
    description: string = "Allows guild administrators to unbind ROBLOX group data from the guild.";
    guardsman: Guardsman;
    defaultMemberPermissions = PermissionFlagsBits.ManageRoles;
    options: ApplicationCommandOptionBase[] = [
        new SlashCommandRoleOption()
            .setName("role")
            .setDescription("The role to bind to.")
            .setRequired(true),
        new SlashCommandNumberOption()
            .setName("group")
            .setDescription("The ID of the group to bind to.")
            .setRequired(true),
        new SlashCommandNumberOption()
            .setName("minrank")
            .setDescription("The minimum rank to obtain the role."),
        new SlashCommandNumberOption()
            .setName("maxrank")
            .setDescription("The maximum rank to obtain the role.")
    ];

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const options = interaction.options;
        const guild = interaction.guild;

        const guildRole = options.getRole("role", true);
        const groupId = options.getNumber("group", true);
        const minRank = options.getNumber("minrank");
        const maxRank = options.getNumber("maxrank");

        // validate role settings
        const groupRoleBind: RoleData<RoleDataGroupBind> = {
            type: "group",
            groupId: groupId,
            minRank: minRank || 0,
            maxRank: typeof maxRank === 'number' ? maxRank : 255
        }

        const existingRole = await this.guardsman.database<IRoleBind>("verification_binds")
            .where({
                guild_id: guild.id,
                role_id: guildRole.id,
                role_data: JSON.stringify(groupRoleBind)
            })
            .first();

        if (!existingRole) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Database")
                        .setDescription(`A group role bind for <@&${guildRole.id}> with those properties does not exist.`)
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({ text: "Guardsman Database" })
                ]
            });

            return;
        }

        await this.guardsman.database<IRoleBind>("verification_binds")
            .delete()
            .where({
                id: existingRole.id,
                guild_id: existingRole.guild_id,
                role_id: existingRole.role_id,
                role_data: existingRole.role_data,
            });

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`Guardsman Database`)
                    .setDescription(`Successfully removed a group bind for <@&${guildRole.id}> for Group ${groupId} at rank ${groupRoleBind.minRank} up to rank ${groupRoleBind.maxRank}.`)
                    .setColor(Colors.Green)
                    .setTimestamp()
                    .setFooter({ text: "Guardsman Database" })
            ]
        })
    }
}