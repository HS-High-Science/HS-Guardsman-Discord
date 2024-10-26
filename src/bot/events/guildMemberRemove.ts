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
import { addInfoToString } from "../util/string.js";
import { GuildMember, TextChannel } from "discord.js";
import { getSettings } from "../util/guild/guildSettings.js";

export default async (guardsman: Guardsman, member: GuildMember) => {
    const guild = member.guild;
    const guildSettings = await getSettings(guardsman, guild);

    try {
        if (guildSettings.guildInfoMessageChannelID !== "") {
            const channel = guild.channels.cache.get(guildSettings.guildInfoMessageChannelID) as TextChannel;

            if (channel) {
                channel.send({
                    content: addInfoToString(guildSettings.leaveMessageContent, { server: guild.name, user: member.user.tag }),
                });
            }
        }
    } catch (error) { }
}