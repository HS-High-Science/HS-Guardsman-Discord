import { Guardsman } from "index";
import { ChatInputCommandInteraction } from "discord.js";

export default class BanIndexCommand implements ICommand {
    name: Lowercase<string> = "ban";
    description: string = "Allowed guild administrators to ban users from the guild.";
    guardsman: Guardsman;

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        return Promise.resolve(undefined);
    }
}