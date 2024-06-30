import { Guardsman } from "index";
import { ChatInputCommandInteraction } from "discord.js";

export default class MigrateIndexCommand implements ICommand {
    name: Lowercase<string> = "migrate";
    description: string = "Migrates users from other databases";
    guardsman: Guardsman;

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        return Promise.resolve(undefined);
    }
}