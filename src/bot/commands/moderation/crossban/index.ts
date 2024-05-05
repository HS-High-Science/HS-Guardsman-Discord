import { Guardsman } from "index";
import { ChatInputCommandInteraction } from "discord.js";

export default class CrossbanIndexCommand implements ICommand {
    name: Lowercase<string> = "crossban";
    description: string = "Allowed guild administrators to ban a user from all controlled guilds.";
    guardsman: Guardsman;

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        return Promise.resolve(undefined);
    }
}