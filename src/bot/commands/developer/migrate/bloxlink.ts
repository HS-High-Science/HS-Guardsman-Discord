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
import { ChatInputCommandInteraction, SlashCommandStringOption } from "discord.js";
import axios from "axios";

export default class BloxlinkMigrateCommand implements ICommand {
    name: Lowercase<string> = "bloxlink";
    description: string = "(DEVELOPER ONLY) Migrates users from Bloxlink.";
    guardsman: Guardsman;
    developer = true;

    options = [
        new SlashCommandStringOption()
            .setName("api_key")
            .setDescription("Bloxlink API KEY.")
            .setRequired(true)
    ];

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const apikey = interaction.options.getString("api_key", true);

        let res = await interaction.guild.members.fetch({ limit: 500 });
        let i = 0;

        res.forEach(member => {
            setTimeout(async () => {
                try {
                    const userdata = await axios.get(`https://api.blox.link/v4/public/guilds/${interaction.guild.id}/discord-to-roblox/${member.id}`, {
                        headers: {
                            Authorization: apikey
                        }
                    });

                    if (userdata.status == 200) {
                        const data = userdata.data;

                        if (data.robloxID) {
                            const userusername = await this.guardsman.roblox.getUsernameFromId(data.robloxID);

                            const existingUser = await this.guardsman.database<IUser>("users")
                                .where("username", userusername)
                                .orWhere("roblox_id", data.robloxID)
                                .orWhere("discord_id", member.id)
                                .first();

                            if (existingUser) {
                                await this.guardsman.database<IUser>("users")
                                    .update({
                                        username: userusername,
                                        roblox_id: data.robloxID,
                                        discord_id: member.id,
                                    })
                                    .where({
                                        id: existingUser.id
                                    })
                            } else {
                                await this.guardsman.database<IUser>("users")
                                    .insert({
                                        username: userusername,
                                        roblox_id: data.robloxID,
                                        discord_id: member.id,
                                        roles: "[\"Player\"]"
                                    })
                            }

                            this.guardsman.log.info(`Logged: ${userusername} (${data.robloxID}) - ${member.nickname || member.user.displayName} (${member.id})`)
                        }
                    }
                } catch (error) {
                    this.guardsman.log.error(`Failed to migrate ${member.nickname || member.user.displayName} (${member.id})`);
                }
            }, 3_000 * i++)
        });
    }
}