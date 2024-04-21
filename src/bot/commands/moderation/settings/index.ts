import { Guardsman } from "index";
import { ChatInputCommandInteraction } from "discord.js";

export default class SettingsCommand implements ICommand {
    name: Lowercase<string> = "settings";
    description: string = "Allows guild admins to configure the bot's settings.";
    guardsman: Guardsman;

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        return Promise.resolve(undefined);
    }

}