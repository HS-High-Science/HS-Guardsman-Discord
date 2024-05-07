import { QueryType } from "discord-player";
import { ChatInputCommandInteraction, Colors, EmbedBuilder, SlashCommandStringOption } from "discord.js";
import { Guardsman } from "index";

export default class PlayCommand implements ICommand {
    name: Lowercase<string> = "play";
    description: string = "Adds provided song to the queue.";
    guardsman: Guardsman;

    options = [
        new SlashCommandStringOption()
            .setName("url")
            .setDescription("The URL or query of the song")
            .setRequired(true),
    ]

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

        const urlQuery = interaction.options.getString("url", true);

        const queue = this.guardsman.bot.musicController.queues.create(interaction.guild);
        if (!queue.connection) await queue.connect(interaction.member.voice.channel);

        const results = await this.guardsman.bot.musicController.search(urlQuery, {
            requestedBy: interaction.user,
            searchEngine: QueryType.AUTO,
        });

        if (results.tracks.length === 0 && !results.playlist) {
            await interaction.editReply("No tracks could be found. Check the query and try again.");
            return;
        }

        const track = results.tracks[0];
        const playlist = results.playlist;

        if (playlist) {
            for (const pTrack of playlist.tracks) {
                queue.addTrack(pTrack);
            }

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Music")
                        .setDescription(`Successfully added ${playlist.tracks.length} tracks to the queue!`)
                        .setColor(Colors.Blurple)
                        .setThumbnail(track.thumbnail)
                        .setFooter({ text: "Guardsman Music" })
                        .setTimestamp()
                ]
            });
        } else {
            queue.addTrack(track);

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Music")
                        .setDescription(`Successfully added \`${track.title} - ${track.author}\` to the queue!`)
                        .setColor(Colors.Blurple)
                        .setThumbnail(track.thumbnail)
                        .setFooter({ text: "Guardsman Music" })
                        .setTimestamp()
                ]
            });
        }

        const firstTrack = queue.tracks.at(0);
        if (!queue.isPlaying() && firstTrack) await queue.play(firstTrack, { nodeOptions: { metadata: interaction } });
    }
}