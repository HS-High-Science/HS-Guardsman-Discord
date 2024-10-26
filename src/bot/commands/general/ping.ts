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

import { ChatInputCommandInteraction, EmbedBuilder, Colors } from "discord.js";
import { Guardsman } from "index";

export default class PingCommand implements ICommand {
    name: Lowercase<string> = "ping";
    description: string = "Shows the ping of the bot.";
    guardsman: Guardsman;

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const embed = new EmbedBuilder()
            .setDescription("`Pinging...`")
            .setColor(Colors.Yellow);

        const msg = await interaction.reply({
            embeds: [embed],
            fetchReply: true
        });

        const latency = `\`\`\`ini\n[ ${Math.floor(msg.createdTimestamp - interaction.createdTimestamp)}ms ]\`\`\``;
        const apiLatency = `\`\`\`ini\n[ ${Math.round(interaction.client.ws.ping)}ms ]\`\`\``;

        embed
            .setTitle(`Pong! 🏓`)
            .setDescription(null)
            .addFields([
                { name: "Latency", value: latency, inline: true },
                { name: "API Latency", value: apiLatency, inline: true },
            ])
            .setColor(Colors.Green)
            .setTimestamp()
            .setFooter({ text: "Guardsman Discord" });

        msg.edit({ embeds: [embed] });
    }
}
