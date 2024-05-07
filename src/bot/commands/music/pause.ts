import { ChatInputCommandInteraction, Colors, EmbedBuilder } from "discord.js";
import { Guardsman } from "index";

export default class PauseCommand implements ICommand {
    name: Lowercase<string> = "pause";
    description: string = "Pauses the current song.";
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

        await queue.node.setPaused(!queue.node.isPaused());

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Guardsman Music")
                    .setDescription(`Successfully ${queue.node.isPaused() && "paused" || "unpaused"} the current song!`)
                    .setColor(Colors.Blurple)
                    .setFooter({ text: "Guardsman Music" })
                    .setTimestamp()
            ]
        });
    }
}