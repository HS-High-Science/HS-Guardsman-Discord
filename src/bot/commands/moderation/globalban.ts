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

import { AxiosResponse } from "axios";
import { ChatInputCommandInteraction, Colors, EmbedBuilder, SlashCommandIntegerOption, SlashCommandStringOption } from "discord.js";
import { Guardsman } from "index";
import { getSettings } from "../../util/guild/guildSettings.js";
import { addInfoToString } from "../../util/string.js";

export default class GlobalBanCommand implements ICommand {
    name: Lowercase<string> = "globalban";
    description: string = "Allows Guardsman moderators to global ban a user from ALL Guardsman-controlled servers.";
    guardsman: Guardsman;

    options = [
        new SlashCommandStringOption()
            .setName("id")
            .setDescription("The Guardsman ID of the user to ban (To find, run /searchuser)")
            .setRequired(true),

        new SlashCommandStringOption()
            .setName("reason")
            .setDescription("The reason for the ban")
            .setRequired(false),

        new SlashCommandIntegerOption()
            .setName("expires")
            .setDescription("When the ban should expire (UNIX Timestamp)")
            .setRequired(false)
    ]

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await interaction.deferReply();

        const guardsmanId = interaction.options.getString("id", true);
        const banReason = interaction.options.getString("reason", false);
        const banExpiry = interaction.options.getInteger("expires", false);

        const moderatorId = await this.guardsman.userbase.getId(interaction.user);
        const canGlobalBan = await this.guardsman.userbase.checkPermissionNode(interaction.user, "moderate:moderate");
        const guildSettings = await getSettings(this.guardsman, interaction.guild);

        if (!canGlobalBan) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman API")
                        .setDescription("You do not have permission to `moderate:moderate`")
                        .setColor(Colors.Red)
                        .setFooter({ text: "Guardsman API" })
                        .setTimestamp()
                ]
            });

            return;
        };

        let userData: AxiosResponse<IAPIUser>;

        try {
            userData = await this.guardsman.backend.get(`discord/user/${guardsmanId}`);
        }
        catch (error) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman API Error")
                        .setDescription(`An error occurred whilst communicating with the Guardsman API. ${error}`)
                        .setColor(Colors.Red)
                        .setFooter({ text: "Guardsman API" })
                        .setTimestamp()
                ]
            })

            return;
        }

        const executingPosition = await this.guardsman.userbase.getPermissionLevel(interaction.member.user);
        if (userData.data.position >= executingPosition) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Moderation")
                        .setDescription(`Your permission level is not high enough to global ban ${userData.data.username}. (${executingPosition}=>${userData.data.position})`)
                        .setColor(Colors.Red)
                        .setFooter({ text: "Guardsman API" })
                        .setTimestamp()
                ]
            })

            return;
        }

        if (banExpiry && banExpiry < Math.floor(Date.now() / 1000)) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Moderation")
                        .setDescription("You cannot ban a user in the past.")
                        .setColor(Colors.Red)
                        .setFooter({ text: "Guardsman Moderation" })
                        .setTimestamp()
                ]
            });

            return;
        }

        const banData: AxiosResponse<IAPIPunishmentData> = await this.guardsman.backend.post(`discord/user/${guardsmanId}/punishment`, {
            type: 1,
            reason: banReason || "No reason provided.",
            expires: banExpiry || 0,
            evidence: [],
            moderator: moderatorId
        });

        // send ban dm to user
        try {
            const user = await this.guardsman.bot.users.cache.find(user => user.id === userData.data.discord_id);
            if (!user) throw new Error("User could not be messaged.");

            await user.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Moderation")
                        .setDescription(addInfoToString(guildSettings.globalBanMessage, { server: interaction.guild.name }))
                        .setColor(Colors.Red)
                        .setFooter({ text: "Guardsman Moderation" })
                        .setTimestamp()
                        .addFields(
                            {
                                name: "REF ID",
                                value: banData.data.id
                            },

                            {
                                name: "Reason",
                                value: banReason || "No Reason Provided"
                            },

                            {
                                name: "Expires",
                                value: (banExpiry != null && `<t:${banExpiry}>` || "Never")
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

        const guilds = this.guardsman.bot.guilds.cache.values();
        const errors = [];
        for (const guild of guilds) {
            try {
                const guildSettings = await getSettings(this.guardsman, guild);
                if (guildSettings.globalBanExcluded) continue;

                await guild.bans.create(userData.data.discord_id, {
                    reason: (banReason || `No reason provided.`) + `; Executed by: ${interaction.member.user.username}`
                });
            }
            catch (error) {
                errors.push(error);
            }
        }

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Guardsman Moderation")
                    .setDescription(`${userData.data.username} has been globally banned from all Guardsman-controlled guilds and experiences.`)
                    .setColor(Colors.Red)
                    .setFooter({ text: "Guardsman Moderation" })
                    .setTimestamp()
                    .addFields(
                        {
                            name: "REF ID",
                            value: banData.data.id
                        },

                        {
                            name: "Reason",
                            value: banReason || "No Reason Provided"
                        },

                        {
                            name: "Expires",
                            value: (banExpiry != null && `<t:${banExpiry}>` || "Never")
                        },

                        {
                            name: "Errors",
                            value: errors.length > 0 && errors.join(",\n") || "None."
                        }
                    )
            ]
        })
    }
}