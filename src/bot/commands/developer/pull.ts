import { Guardsman } from "index";
import {ChatInputCommandInteraction, SlashCommandStringOption} from "discord.js";
import { exec } from "child_process";

export default class PullCommand implements ICommand
{
    name: Lowercase<string> = "pull";
    description: string = "(DEVELOPER ONLY) Pulls the latest bot changes and restarts.";
    guardsman: Guardsman;
    developer = true;

    options = [
        new SlashCommandStringOption()
            .setName('branch')
            .setDescription('The branch to pull from')
            .setRequired(true)
    ];

    constructor(guardsman: Guardsman)
    {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void>
    {
        await interaction.reply("Pulling latest changes from GitHub...");

        exec(`git pull https://AstroHWeston:glpat-o3F5yPa7y6C_XXP1Vngx@gitlab.astrohweston.xyz/high-science/guardsman-discord.git ${interaction.options.getString("branch")}`, async (error, stdout, stderr) =>
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
            await interaction.editReply("Updated!");
        })
    }
}
