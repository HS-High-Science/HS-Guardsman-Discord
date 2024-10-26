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

import { ChatInputCommandInteraction, EmbedBuilder, Colors, Embed } from "discord.js";
import { Guardsman } from "index";

const images = {
    newUser: "https://cdn.imskyyc.com/i/rKC1V5u",
    reverify: "https://cdn.imskyyc.com/i/lEBbWpZX1",
    authorize: "https://cdn.imskyyc.com/i/UM85P8j",
    completeWeb: "https://cdn.imskyyc.com/i/1WS0h",
    completeGuild: "https://cdn.imskyyc.com/i/8VuPtJQm"
}

export default class VerificationInfoCommand implements ICommand {
    name: Lowercase<string> = "verificationinfo";
    description: string = "Shows how to verify.";
    guardsman: Guardsman;

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const embeds = [
            new EmbedBuilder()
                .setTitle("Guardsman Verification - Getting Started")
                .setDescription("To get started with Guardsman Verification, run `/verify` in the verification channel. Upon executing `/verify`, the following prompt will appear:")
                .setImage(images.newUser)
                .setColor(Colors.Blue),
            new EmbedBuilder()
                .setTitle("Guardsman Verification - Login with ROBLOX")
                .setDescription("Upon clicking \"Login with ROBLOX\", you will be greeted with the authorization page for Bunker Bravo Interactive's Guardsman system. Wait for the countdown, and press continue.")
                .setImage(images.authorize)
                .setColor(Colors.Blue),
            new EmbedBuilder()
                .setTitle("Guardsman Verification - Completed")
                .setDescription("Once you see the verification complete page, you can continue into the Discord Guild by running `/update`.")
                .setImage(images.completeGuild)
                .setColor(Colors.Blue)
        ]

        interaction.reply({
            embeds
        })
    }
}