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
import { updateUser } from "../util/user.js";
import { Colors, EmbedBuilder } from "discord.js";
import { getSettings } from "../util/guild/guildSettings.js";

export default async (guardsman: Guardsman, discordId: string) => {
    const interaction = guardsman.bot.pendingVerificationInteractions[discordId];

    const guildSettings = await getSettings(guardsman, interaction.guild);

    try {
        if (guildSettings.autoUpdateOnVerification) {
            const userInGuild = await interaction.guild.members.fetch(interaction.member.id).catch(() => null);

            const existingData = await guardsman.database<IUser>("users")
                .where({
                    discord_id: interaction.member.id
                })
                .first();

            if (existingData && userInGuild) {
                await updateUser(guardsman, interaction.guild, userInGuild, existingData)

                return;
            }
        }

        const reply = await interaction.editReply({
            components: [],

            embeds: [
                new EmbedBuilder()
                    .setTitle(`Guardsman Verification`)
                    .setDescription(
                        "Discord account verification was successful! Please run `/update` to obtain roles."
                    )
                    .setColor(Colors.Green)
                    .setTimestamp()
                    .setFooter({
                        text: "Guardsman Verification"
                    }),
            ],
        });

        //await reply.reply(`<@${interaction.member.id}>`) // Errors.
    }
    catch (err) { }
}