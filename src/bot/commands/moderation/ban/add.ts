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

import { ChatInputCommandInteraction, Colors, EmbedBuilder, PermissionFlagsBits, SlashCommandUserOption, SlashCommandStringOption } from "discord.js";
import { getSettings } from "../../../util/guild/guildSettings.js";
import { addInfoToString } from "../../../util/string.js";
import { Guardsman } from "index";

export default class BanCommand implements ICommand {
    name: Lowercase<string> = "add";
    description: string = "Allows Guild moderators to ban a user from this guild.";
    guardsman: Guardsman;
    defaultMemberPermissions?: string | number | bigint | null | undefined = PermissionFlagsBits.BanMembers;

    options = [
        new SlashCommandUserOption()
            .setName("user")
            .setDescription("The user to ban (To find, run /searchuser)")
            .setRequired(true),

        new SlashCommandStringOption()
            .setName("reason")
            .setDescription("The reason for the ban")
            .setRequired(false),
    ]

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await interaction.deferReply();

        const banReason = interaction.options.getString("reason") || "No Reason Provided";
        const user = interaction.options.getUser("user");

        const guildSettings = await getSettings(this.guardsman, interaction.guild);

        if (!user) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Moderation")
                        .setDescription("No member was found.")
                        .setColor(Colors.Red)
                        .setFooter({ text: "Guardsman Moderation" })
                        .setTimestamp()
                ]
            });

            return;
        }

        // send ban dm to user
        try {
            const person = this.guardsman.bot.users.cache.get(user.id);
            if (!person) throw new Error("User could not be messaged.");

            await person.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Moderation")
                        .setDescription(addInfoToString(guildSettings.banMessage, { server: interaction.guild.name }))
                        .setColor(Colors.Red)
                        .setFooter({ text: "Guardsman Moderation" })
                        .setTimestamp()
                        .addFields(
                            {
                                name: "Reason",
                                value: banReason
                            }
                        )
                ]
            })
        }
        catch (error) {
            await interaction.channel?.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Moderation")
                        .setDescription(`Failed to send ban DM. ${error}`)
                        .setColor(Colors.Orange)
                        .setFooter({ text: "Guardsman API" })
                        .setTimestamp()
                ]
            });
        }

        try {
            await interaction.guild.bans.create(user.id, {
                reason: banReason + `; Executed by: ${interaction.member.user.username}`
            });
        }
        catch (error) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Moderation")
                        .setDescription(`Failed to ban <@${user.id}>. ${error}`)
                        .setColor(Colors.Red)
                        .setFooter({ text: "Guardsman Moderation" })
                        .setTimestamp()
                ]
            });

            return;
        }

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Guardsman Moderation")
                    .setDescription(`${user.username} has been banned from the guild.`)
                    .setColor(Colors.Green)
                    .setFooter({ text: "Guardsman Moderation" })
                    .setTimestamp()
                    .addFields(
                        {
                            name: "Reason",
                            value: banReason
                        }
                    )
            ]
        })
    }
}