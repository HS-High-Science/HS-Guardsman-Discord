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