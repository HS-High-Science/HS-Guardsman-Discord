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

import { Guardsman, GuardsmanState } from "../../index.js";
import { ActivityType } from "discord.js";
import { readFile, unlink } from "fs";

export default async (guardsman: Guardsman) => {
    guardsman.log.info("Guardsman ready.")
    guardsman.state = GuardsmanState.ONLINE;

    // set ping interval
    guardsman.sendStartupPing();
    setInterval(guardsman.sendClientPing, 30E3);

    // check for reboot file
    try {
        readFile(".rm-rebootfile", async (err, data) => {
            if (!data) return;

            const rebootData = JSON.parse(data.toString());

            const guild = await guardsman.bot.guilds.fetch(rebootData.guild);
            if (!guild) return;

            const channel = await guild.channels.fetch(rebootData.channel);
            if (!channel || !channel.isTextBased()) return;

            const message = await channel.messages.fetch(rebootData.message);
            if (!message) return;

            message.edit("Reboot complete.");

            unlink(".rm-rebootfile", () => { });
        })
    }
    catch (error) { }

    guardsman.bot.user?.setPresence({
        status: "online",
        activities: [
            {
                name: `in the tunnels`,
                type: ActivityType.Playing,
            }
        ]
    })
}