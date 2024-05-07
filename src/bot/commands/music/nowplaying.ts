import { ChatInputCommandInteraction, Colors, EmbedBuilder, AttachmentBuilder } from "discord.js";
import { classicCard } from "songcard";
import { Guardsman } from "index";

export default class NowPlayingCommand implements ICommand {
    name: Lowercase<string> = "np";
    description: string = "Shows the current song.";
    guardsman: Guardsman;

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await interaction.deferReply();

        if (!interaction.member.voice.channel) {
            await interaction.editReply({
                content: "You must connect to a voice channel before running music commands!"
            });

            return;
        }

        if (!interaction.channel) return;

        const queue = this.guardsman.bot.musicController.queues.get(interaction.guild);
        if (!queue || !queue.currentTrack) {
            await interaction.editReply({
                content: "The queue is empty!"
            });

            return;
        }

        const currentTrack = queue.currentTrack;

        const cardImage = await classicCard({
            imageBg: currentTrack.thumbnail ?? this.guardsman.bot.user?.avatarURL({ extension: "png", size: 4096 }),
            imageText: currentTrack.title,
            trackStream: false,
            trackDuration: (queue.node.getTimestamp()?.progress ?? 0) * 1000,
            trackTotalDuration: currentTrack.durationMS,
        });

        const attachment = new AttachmentBuilder(cardImage, {
            name: "songcard.png"
        })

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Guardsman Music")
                    .setDescription(`[${currentTrack.title}](${currentTrack.url})`)
                    .setFields([
                        {
                            name: "Requested by",
                            value: `${currentTrack.requestedBy?.id ? `<@${currentTrack.requestedBy?.id}>` : "Unknown"}`,
                            inline: true,
                        },
                    ])
                    .setColor(Colors.Blurple)
                    .setImage("attachment://songcard.png")
                    .setFooter({ text: "Guardsman Music" })
                    .setTimestamp()
            ], files: [attachment]
        });
    }
}