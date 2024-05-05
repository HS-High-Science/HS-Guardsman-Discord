import { Guardsman } from "index";
import { addInfoToString } from "../util/string.js";
import { GuildMember, TextChannel } from "discord.js";
import { getSettings } from "../util/guildSettings.js";

export default async (guardsman: Guardsman, member: GuildMember) => {
    const guild = member.guild;
    const guildSettings = await getSettings(guardsman, guild);

    try {
        if (guildSettings.guildInfoMessageChannelID !== "") {
            const channel = guild.channels.cache.get(guildSettings.guildInfoMessageChannelID) as TextChannel;

            if (channel) {
                channel.send({
                    content: addInfoToString(guildSettings.leaveMessageContent, { server: guild.name, user: member.user.tag }),
                });
            }
        }
    } catch (error) { }
}