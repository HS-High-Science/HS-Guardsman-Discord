import { Guardsman } from "index";
import {ChatInputCommandInteraction} from "discord.js";
import { exec } from "child_process";

export default class PullCommand implements ICommand
{
    name: Lowercase<string> = "pull";
    description: string = "(DEVELOPER ONLY) Pulls the latest bot changes and restarts.";
    guardsman: Guardsman;
    developer = true;

    constructor(guardsman: Guardsman)
    {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void>
    {
        await interaction.reply("Pulling latest changes from Git...");

        exec("git pull", async (error, stdout, stderr) =>
        {
            if (error)
            {
                await interaction.editReply(`Pull failed: ${error}`);

                return;
            }

            if (stdout.includes("Already up to date."))
            {
                await interaction.editReply("Up-to-date.");

                return;
            }

            await interaction.editReply("Updated! Updating dependencies must be done manually at this time. Please make sure all dependencies are up-to-date before recompiling and restarting.");
        })
    }
}