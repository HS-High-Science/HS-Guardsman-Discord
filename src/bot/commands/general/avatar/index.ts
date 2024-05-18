import { Guardsman } from "index";
import { ChatInputCommandInteraction } from "discord.js";

export default class AvatarIndexCommand implements ICommand {
    name: Lowercase<string> = "avatar";
    description: string = "Gets a users avatar.";
    guardsman: Guardsman;

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        return Promise.resolve(undefined);
    }
}