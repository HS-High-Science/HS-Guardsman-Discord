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

export default class ClearPendingVerifications implements ICommand {
    name: Lowercase<string> = "clearpendingverifications";
    description: string = "(DEVELOPER ONLY) Clears all in-progress verification tokens.";
    guardsman: Guardsman;
    developer = true;

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await interaction.reply("Clearing...")

        await this.guardsman.database<IVerificationConfirmation>("pending_verification")
            .truncate();

        await interaction.editReply("Cleared!")
    }
}
