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
import os from "node:os";
import child_process from "node:child_process";
import moment from 'moment';
import 'moment-duration-format';

function formatDuration(duration: number | null): string {
    return moment.duration(duration).format("d[ Days]・h[ Hrs]・m[ Mins]・s[ Secs]");
}

export default class AboutCommand implements ICommand {
    name: Lowercase<string> = "about";
    description: string = "Shows info about the bot.";
    guardsman: Guardsman;

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        let gitHash = "unknown";
        try {
            gitHash = child_process
                .execSync("git rev-parse HEAD")
                .toString()
                .trim();
        } catch (e) {
            gitHash = "unknown";
        }

        const statsEmbed = new EmbedBuilder()
            .setTitle(`Guardsman Information`)
            .setColor(Colors.Green)
            .setDescription(`This bot is provided by Bunker Bravo Interactive. If you have any questions or concerns, please contact us at [our website](https://www.bunkerbravointeractive.com). To create your own network, check out [our GitLab](https://git.bunkerbravointeractive.com/bunker-bravo-interactive)!`)
            .setFields([
                {
                    name: "General Stats",
                    value: `\`\`\`yml\nName: ${this.guardsman.bot.user?.username}#${this.guardsman.bot.user?.discriminator}\nID: ${this.guardsman.bot.user?.id}\`\`\``,
                    inline: true,
                },
                {
                    name: "Bot Stats",
                    value: `\`\`\`yml\nGuilds: ${this.guardsman.bot.guilds.cache.size}\nUptime: ${formatDuration(this.guardsman.bot.uptime)}\nNodeJS: ${process.version}\nMemory Usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\`\`\``,
                    inline: true,
                },
                {
                    name: "System Stats",
                    value: `\`\`\`yml\nOS: ${os.platform() + " " + os.release()}\nArch: ${os.machine()}\nUptime: ${formatDuration(os.uptime() * 1000)}\n\`\`\``,
                    inline: false,
                },
                {
                    name: "Build Stats",
                    value: `\`\`\`yml\nGuardsman: v1.0.0\nBuild: ${gitHash}\n\`\`\``,
                    inline: false,
                },
            ])
            .setTimestamp()
            .setFooter({ text: `Guardsman Information` });

        await interaction.reply({ embeds: [statsEmbed], ephemeral: false });
    }
}