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

const cleanString = async (guardsman: Guardsman, string: string | Promise<string>) => {
    string = await string;

    const environment = guardsman.environment;

    const BLOCKED_VALUES = [
        environment.DISCORD_BOT_TOKEN,
        environment.ROBLOX_CLIENT_TOKEN,
        environment.ROBLOX_COOKIE,
        environment.DB_PASSWORD
    ]

    for (const value of BLOCKED_VALUES) {
        string = string.replace(value, "[Content Removed for Security Reasons.]")
    }

    string = string.replace(/`/g, "`" + String.fromCharCode(8203));
    string = string.replace(/@/g, "@" + String.fromCharCode(8203));

    return string;
}

export default class EvalCommand implements ICommand {
    name: Lowercase<string> = "eval";
    description: string = "(DEVELOPER ONLY) Executes raw JavaScript.";
    guardsman: Guardsman;
    developer = true;

    options = [
        new SlashCommandStringOption()
            .setName("code")
            .setDescription("The code to execute.")
            .setRequired(true)
    ]

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const code = interaction.options.getString("code", true);

        try {
            const evalReturn = eval(code);
            const cleanReturn = await cleanString(this.guardsman, evalReturn);

            await interaction.reply({
                content: "Executed successfully.",
                files: [
                    {
                        attachment: Buffer.from(cleanReturn),
                        name: "result.js"
                    }
                ]
            })
        }
        catch (error: any) {
            await interaction.reply({
                content: "Execution failed.",
                files: [
                    {
                        attachment: Buffer.from(await cleanString(this.guardsman, error)),
                        name: "result.js"
                    }
                ]
            })
        }
    }

}