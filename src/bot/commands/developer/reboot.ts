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
import { ChatInputCommandInteraction } from "discord.js";
import * as process from "process";
import { writeFile } from "fs/promises";

export default class PullCommand implements ICommand {
    name: Lowercase<string> = "reboot";
    description: string = "(DEVELOPER ONLY) Reboots the bot.";
    guardsman: Guardsman;
    developer = true;

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const reply = await interaction.reply({
            content: "Rebooting...",
            fetchReply: true
        });

        await writeFile(".rm-rebootfile", JSON.stringify({
            guild: interaction.guild.id,
            channel: interaction.channel?.id,
            message: reply.id
        }))

        process.exit(1);
    }
}