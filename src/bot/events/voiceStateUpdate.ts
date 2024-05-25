import { Colors, EmbedBuilder, VoiceState } from "discord.js";
import { Guardsman } from "index";

export default async (guardsman: Guardsman, oldState: VoiceState, newState: VoiceState) => {
    if (!newState.channel?.members.find(member => member.id == guardsman.bot.user?.id)) {
        delete guardsman.bot.skipVotes[oldState.guild.id];
    }

    // check if user who left had voted to skip the current song;
    if (!oldState.member || !oldState.channel) return;
    if (newState.channel) return;

    const voteData = guardsman.bot.skipVotes[oldState.guild.id];
    if (!voteData || oldState.channelId != voteData.channelId) return;

    const memberIndex = voteData.voted.indexOf(oldState.member.id)
    if (memberIndex) {
        if (oldState.channel.members.size - 1 == 2) {
            delete guardsman.bot.skipVotes[oldState.guild.id];

            await oldState.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Music")
                        .setDescription(`Only one user is left in the channel. Skipvotes have been reset.`)
                        .setColor(Colors.Blurple)
                        .setFooter({ text: "Guardsman Music" })
                        .setTimestamp()
                ]
            })
        }
        else {
            voteData.needed = Math.floor(oldState.channel.members.size - 1 * 0.75);
            voteData.voted.splice(memberIndex, 1);

            await oldState.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Music")
                        .setDescription(`A user who voted to skip the current song left the channel. New votes: (${voteData.voted.length}/${voteData.needed})`)
                        .setColor(Colors.Blurple)
                        .setFooter({ text: "Guardsman Music" })
                        .setTimestamp()
                ]
            })
        }
    }
}