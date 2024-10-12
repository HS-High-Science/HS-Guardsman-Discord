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
    EmbedBuilder,
    PermissionFlagsBits,
    SlashCommandUserOption
} from "discord.js";
import { Guardsman } from "index";
import { updateUser } from "../../util/user.js"

export default class UpdateCommand implements ICommand {
    name: Lowercase<string> = "forceupdate";
    description: string = "Allows guild admins to force update a user's Discord roles.";
    guardsman: Guardsman;
    defaultMemberPermissions = PermissionFlagsBits.ModerateMembers

    options = [
        new SlashCommandUserOption()
            .setName("user")
            .setDescription("The user to update.")
            .setRequired(true)
    ]

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await interaction.deferReply();

        const guild = interaction.guild;

        const user = interaction.options.getUser("user", true);
        const guildMember = interaction.guild.members.resolve(user.id);

        const existingUserData = await this.guardsman.database<IUser>("users")
            .where("discord_id", user.id)
            .first();

        if (!existingUserData) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Verification")
                        .setDescription(`<@${user.id}> is not verified with Guardsman.`)
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({ text: "Guardsman Verification" })
                ]
            })

            return;
        }

        if (!guildMember) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Verification")
                        .setDescription(`<@${user.id}> is not a member of this guild.`)
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({ text: "Guardsman Verification" })
                ]
            })

            return;
        }

        let userReturn = await updateUser(this.guardsman, guild, guildMember, existingUserData);

        let InfoEmbed = new EmbedBuilder()
            .setTitle("Guardsman Verification")
            .setDescription(`Role update complete. See details below.`)
            .setColor(userReturn.errors.length > 0 && Colors.Orange || Colors.Green)
            .setTimestamp()
            .setFooter({ text: "Guardsman Verification" })
            .addFields(
                {
                    name: "Added Roles",
                    value: `${userReturn.addedRoles.length > 0 && "• " || "None."}${userReturn.addedRoles.map(r => "<@&" + r.role_id + '>').join("\n • ")}`,
                    inline: true
                },

                {
                    name: "Removed Roles",
                    value: `${userReturn.removedRoles.length > 0 && "• " || "None."}${userReturn.removedRoles.map(r => "<@&" + r.role_id + '>').join("\n •")}`,
                    inline: true
                }
            );

        if (userReturn.extra) {
            InfoEmbed.setColor(Colors.Red)
            InfoEmbed.addFields({
                name: "Extra",
                value: userReturn.extra
            });
        }

        if (userReturn.errors.length > 0) {
            InfoEmbed.addFields({
                name: "Errors",
                value: userReturn.errors.join("\n")
            });
        }

        await interaction.editReply({
            embeds: [InfoEmbed]
        })
    }
}