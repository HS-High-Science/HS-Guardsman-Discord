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

import { AutocompleteInteraction, ChatInputCommandInteraction, Colors, EmbedBuilder, SlashCommandStringOption } from "discord.js";
import { Guardsman } from "index";
import { AxiosResponse } from "axios";

export default class SearchUserCommand implements ICommand {
    name: Lowercase<string> = "searchuser";
    description: string = "Allows guild moderators to search for a user's Guardsman data";
    guardsman: Guardsman;

    options = [
        new SlashCommandStringOption()
            .setName("query")
            .setDescription("The field to search for (Roblox Username)")
            .setRequired(true)
            .setAutocomplete(true)
    ]

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await interaction.deferReply();

        const canGlobalBan = await this.guardsman.userbase.checkPermissionNode(interaction.user, "moderate:search");

        if (!canGlobalBan) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman API")
                        .setDescription("You do not have permission to `moderate:search`")
                        .setColor(Colors.Red)
                        .setFooter({ text: "Guardsman API" })
                        .setTimestamp()
                ]
            });

            return;
        };

        const query = interaction.options.getString("query", true);
        let userData: AxiosResponse<IUser>;

        try {
            userData = await this.guardsman.backend.get(`discord/user/by-username/${query}`);
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

        const Headshot = await this.guardsman.roblox.getPlayerThumbnail(Number(userData.data.roblox_id), "420x420", "png", false, "headshot").then(Headshot => Headshot[0].imageUrl + ".png");

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(userData.data.username)
                    .setColor(Colors.Green)
                    .setFooter({ text: "Guardsman Database" })
                    .setTimestamp()
                    .setThumbnail(Headshot)
                    .addFields(
                        {
                            name: "Guardsman ID",
                            value: userData.data.id?.toString() || "Unknown",
                            inline: true
                        },

                        {
                            name: "Username",
                            value: userData.data.username,
                            inline: true
                        },

                        {
                            name: "ROBLOX ID",
                            value: userData.data.roblox_id,
                            inline: true
                        },

                        {
                            name: "Discord ID",
                            value: userData.data.discord_id,
                            inline: true
                        },

                        {
                            name: "Roles",
                            value: `${userData.data.roles}`,
                            inline: true
                        },

                        {
                            name: "Verified At",
                            value: userData.data.created_at?.toString() || "Unknown",
                            inline: true
                        }
                    )
            ]
        })
    }

    async autocomplete(interaction: AutocompleteInteraction<"cached">): Promise<void> {
        const query = interaction.options.getString("query", true);
        if (query == "") return;

        this.guardsman.backend.get(`discord/search/${query}`)
            .then(response => {
                interaction.respond(response.data);
            })
            .catch(error => { })
    }
}