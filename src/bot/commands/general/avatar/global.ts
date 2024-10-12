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

import { ChatInputCommandInteraction, EmbedBuilder, Colors, ApplicationCommandOptionBase, SlashCommandUserOption, User } from "discord.js";
import { Guardsman } from "index";

function getAvatarURL(user: User, extension: "webp" | "png" | "jpg" | "jpeg" | "gif" | undefined) {
    return user.avatarURL({ size: 4096, forceStatic: false, extension: extension });
}

export default class GlobalAvatarCommand implements ICommand {
    name: Lowercase<string> = "global";
    description: string = "Get the global avatar of a user.";
    guardsman: Guardsman;

    options: ApplicationCommandOptionBase[] = [
        new SlashCommandUserOption()
            .setName("user")
            .setDescription("User to get the global avatar of.")
            .setRequired(true),
    ];

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const user = interaction.options.getUser("user", true);

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`${user.username}'s Global Avatar`)
                    .setColor(Colors.Green)
                    .setImage(user.displayAvatarURL({ size: 4096, forceStatic: false, extension: "png" }))
                    .setDescription(`[Png](${getAvatarURL(user, "png")}) | [Webp](${getAvatarURL(user, "webp")}) | [Jpg](${getAvatarURL(user, "jpg")}) | [Gif](${getAvatarURL(user, "gif")})`)
                    .setTimestamp()
                    .setFooter({ text: "Guardsman Discord" })
            ]
        });
    }
}