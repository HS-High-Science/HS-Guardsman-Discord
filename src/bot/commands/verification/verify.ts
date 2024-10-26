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

import { randomUUID } from "node:crypto";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Colors, EmbedBuilder } from "discord.js";
import { Guardsman } from "index";
import { getSettings } from "../../util/guild/guildSettings.js";

export default class VerifyCommand implements ICommand {
    name: Lowercase<string> = "verify";
    description: string = "Allows users to link their ROBLOX account to Discord.";
    guardsman: Guardsman;

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const member = interaction.member;
        const channel = interaction.channel;

        const guildSettings = await getSettings(this.guardsman, interaction.guild);

        if (!guildSettings.allowVerification) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Verification")
                        .setDescription("Verification is currently turned off in this guild!")
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({ text: "Guardsman Verification" })
                ],
                ephemeral: true
            })

            return;
        }

        const existingUserData = await this.guardsman.database<IUser>("users")
            .where("discord_id", member.id)
            .first();

        if (existingUserData) {
            const continueVerification = await new Promise<boolean>(async (resolve) => {
                const collector = channel?.createMessageComponentCollector({
                    time: 30_000,
                    filter: (interact) => interact.member.id === member.id,
                    maxComponents: 1
                })

                collector?.on("collect", (collected) => {
                    collected.deferUpdate();

                    if (collected.customId == "continue") {
                        resolve(true);
                    }
                    else {
                        resolve(false);
                    }
                })

                collector?.on("end", (collected) => {
                    if (collected.size == 0) {
                        resolve(false);
                    }
                })

                await interaction.reply({
                    ephemeral: true,
                    components: [
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setLabel("Continue")
                                    .setCustomId("continue")
                                    .setStyle(ButtonStyle.Success),
                                new ButtonBuilder()
                                    .setLabel("Cancel")
                                    .setCustomId("cancel")
                                    .setStyle(ButtonStyle.Danger)
                            )
                    ],

                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Guardsman Verification")
                            .setDescription("You are already verified with Guardsman! If you meant to `update` your roles, run `/update`. Otherwise, press continue below.")
                            .setColor(Colors.Orange)
                            .setTimestamp()
                            .setFooter({ text: "Guardsman Verification - Prompt will time out in 30 seconds" })
                    ]
                })
            })
                .then((response) => {
                    if (!response) {
                        interaction.editReply({
                            components: [],
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle("Guardsman Verification")
                                    .setDescription(`Prompt cancelled or timed-out.`)
                                    .setColor(Colors.Red)
                                    .setTimestamp()
                                    .setFooter({ text: "Guardsman Verification" })
                            ]
                        })

                        return false;
                    }

                    return response;
                })
                .catch((error) => {
                    return interaction.editReply({
                        components: [],
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Guardsman Verification")
                                .setDescription(`${error}`)
                                .setColor(Colors.Red)
                                .setTimestamp()
                                .setFooter({ text: "Guardsman Verification" })
                        ]
                    })
                })

            if (!continueVerification) return;
        }

        const token = randomUUID().replace("-", "") + `-${member.id}`;

        await this.guardsman.database<IVerificationConfirmation>("pending_verification")
            .insert({
                discord_id: interaction.member.id,
                token: token
            })

        this.guardsman.bot.pendingVerificationInteractions[member.id] = interaction;

        const replied = interaction.replied;

        const replyData = {
            components: [
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel("Login with ROBLOX")
                            .setStyle(ButtonStyle.Link)
                            .setURL(`https://authorize.roblox.com/?client_id=${this.guardsman.environment.ROBLOX_CLIENT_ID}&response_type=Code&redirect_uri=${encodeURI(this.guardsman.environment.APP_URL)}verification-callback&scope=openid+profile&state=${token}&nonce=0&step=accountConfirm&nl=true&nl=true`)
                    )
            ],

            embeds: [
                new EmbedBuilder()
                    .setTitle("Guardsman Verification")
                    .setDescription("This guild utilizes guardsman verification in order to verify the identities of those joining. Please log in with ROBLOX to continue. **Do not share your verification link with anybody!**")
                    .setColor(Colors.Blurple)
                    .setTimestamp()
                    .setFooter({ text: "Guardsman Verification - Prompt will time out in 5 minutes." })
            ]
        }

        if (replied) {
            await interaction.editReply(replyData);
        }
        else {
            await interaction.reply({
                ephemeral: true,
                ...replyData
            });
        }
    }
}
