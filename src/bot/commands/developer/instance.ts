import { ChatInputCommandInteraction } from "discord.js";
import { Guardsman } from "index";

export default class InstanceCommand implements ICommand {
    name: Lowercase<string> = "instance";
    description: string = "(DEVELOPER) Returns the instance ID of this bot";
    guardsman: Guardsman;
    developer = true;

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await interaction.reply(this.guardsman.clientGUID);
    }
}