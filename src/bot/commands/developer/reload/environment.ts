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
import { ChatInputCommandInteraction, Colors, EmbedBuilder } from "discord.js";
import { config as parseEnv } from "dotenv";

export default class ReloadEnvironmentSubcommand implements ICommand {
    name: Lowercase<string> = "environment";
    description = "(DEVELOPER ONLY) Reloads the bot environment file."
    developer = true;

    guardsman: Guardsman;

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const environment = parseEnv().parsed || {};
        await interaction.deferReply();

        try {
            this.guardsman.environment = environment;

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Environment reloaded")
                        .setDescription(`Environment has successfully been reloaded.`)
                        .setColor(Colors.Green),
                ],
            });
        }
        catch (error) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Component Reload failed")
                        .setDescription(`Environment failed to reload. ${error}`)
                        .setColor(Colors.Red),
                ]
            })
        }
    }
}