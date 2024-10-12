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

import { ChatInputCommandInteraction, Colors, EmbedBuilder, PermissionFlagsBits, SlashCommandMentionableOption, SlashCommandStringOption } from "discord.js";
import { getSettings } from "../../util/guild/guildSettings.js";
import { addInfoToString } from "../../util/string.js";
import { Guardsman } from "index";

export default class KickCommand implements ICommand {
    name: Lowercase<string> = "kick";
    description: string = "Allows Guild moderators to kick a user from this guild.";
    guardsman: Guardsman;
    defaultMemberPermissions?: string | number | bigint | null | undefined = PermissionFlagsBits.KickMembers;

    options = [
        new SlashCommandMentionableOption()
            .setName("user")
            .setDescription("The user to kick (To find, run /searchuser)")
            .setRequired(true),

        new SlashCommandStringOption()
            .setName("reason")
            .setDescription("The reason for the kick")
            .setRequired(false),
    ]

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await interaction.deferReply();

        const kickReason = interaction.options.getString("reason") || "No Reason Provided";
        const member = interaction.options.getMember("user");

        const guildSettings = await getSettings(this.guardsman, interaction.guild);

        if (!member) {
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

        // send kick dm to user
        try {
            const user = this.guardsman.bot.users.cache.get(member.id);
            if (!user) throw new Error("User could not be messaged.");

            await user.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Moderation")
                        .setDescription(addInfoToString(guildSettings.kickMessage, { server: interaction.guild.name }))
                        .setColor(Colors.Red)
                        .setFooter({ text: "Guardsman Moderation" })
                        .setTimestamp()
                        .addFields(
                            {
                                name: "Reason",
                                value: kickReason
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
                        .setDescription(`Failed to send kick DM. ${error}`)
                        .setColor(Colors.Orange)
                        .setFooter({ text: "Guardsman API" })
                        .setTimestamp()
                ]
            });
        }

        try {
            await member.kick((kickReason) + `; Executed by: ${interaction.member.user.username}`)
        }
        catch (error) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Moderation")
                        .setDescription(`Failed to kick <@${member.id}>. ${error}`)
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
                    .setDescription(`${member.user.username} has been kicked from the guild.`)
                    .setColor(Colors.Green)
                    .setFooter({ text: "Guardsman Moderation" })
                    .setTimestamp()
                    .addFields(
                        {
                            name: "Reason",
                            value: kickReason
                        }
                    )
            ]
        })
    }
}