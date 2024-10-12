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
import { exec } from "child_process";

export default class PullCommand implements ICommand {
    name: Lowercase<string> = "pull";
    description: string = "(DEVELOPER ONLY) Pulls the latest bot changes and restarts.";
    guardsman: Guardsman;
    developer = true;

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await interaction.reply("Pulling latest changes from Git...");

        exec("git pull", async (error, stdout, stderr) => {
            if (error) {
                await interaction.editReply(`Pull failed: ${error}`);

                return;
            }

            if (stdout.includes("Already up to date.")) {
                await interaction.editReply("Up-to-date.");

                return;
            }

            await interaction.editReply("Updated! Updating dependencies must be done manually at this time. Please make sure all dependencies are up-to-date before recompiling and restarting.");
        })
    }
}