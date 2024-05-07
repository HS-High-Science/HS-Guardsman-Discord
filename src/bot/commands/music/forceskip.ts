import { ChatInputCommandInteraction, Colors, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { Guardsman } from "index";

export default class ForceSkipCommand implements ICommand {
    name: Lowercase<string> = "forceskip";
    description: string = "Force skips the current song.";
    guardsman: Guardsman;
    defaultMemberPermissions?: string | number | bigint | null | undefined = PermissionFlagsBits.ModerateMembers;

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

        const queue = this.guardsman.bot.musicController.queues.get(interaction.guild);
        if (!queue || !queue.currentTrack) {
            await interaction.editReply({
                content: "The queue is empty!"
            });

            return;
        }

        await queue.removeTrack(queue.currentTrack);
        await queue.node.skip();

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Guardsman Music")
                    .setDescription(`Successfully force skipped the song!`)
                    .setColor(Colors.Blurple)
                    .setFooter({ text: "Guardsman Music" })
                    .setTimestamp()
            ]
        });
    }
}