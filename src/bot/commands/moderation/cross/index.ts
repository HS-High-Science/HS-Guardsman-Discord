import { Guardsman } from "index";
import { ChatInputCommandInteraction } from "discord.js";

export default class ReloadCommand implements ICommand
{
    name: Lowercase<string> = "cross";
    description: string = "Allows Guardsman moderators to cross ban/unban a user from ALL Guardsman-controlled servers.";
    guardsman: Guardsman;

    constructor(guardsman: Guardsman)
    {
        this.guardsman = guardsman;
    }

    execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        return Promise.resolve(undefined);
    }
}
