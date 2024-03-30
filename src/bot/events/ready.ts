import { Guardsman, GuardsmanState } from "../../index.js";
import { ActivityType } from "discord.js";
import { readFile, unlink } from "fs";

export default async (guardsman: Guardsman) =>
{
    guardsman.log.info("Guardsman ready.")
    guardsman.state = GuardsmanState.ONLINE;

    // set ping interval
    guardsman.sendStartupPing();
    setInterval(guardsman.sendClientPing, 30E3);

    // check for reboot file
    try 
    {
        readFile(".rm-rebootfile", async (err, data) =>
        {
            if (!data) return;

            const rebootData = JSON.parse(data.toString());

            const guild = await guardsman.bot.guilds.fetch(rebootData.guild);
            if (!guild) return;

            const channel = await guild.channels.fetch(rebootData.channel);
            if (!channel || !channel.isTextBased()) return;

            const message = await channel.messages.fetch(rebootData.message);
            if (!message) return;

            message.edit("Reboot complete.");

            unlink(".rm-rebootfile", () => {});
        })
    } 
    catch (error) 
    {}

    guardsman.bot.user?.setPresence({
        status: "dnd",
        activities: [
            {
                name: `with your emotions.`,
                type: ActivityType.Playing,
            }
        ]
    })
}
