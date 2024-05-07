import { APIEmbedField, ApplicationCommandOptionBase, AutocompleteInteraction, ChatInputCommandInteraction, Colors, EmbedBuilder, SlashCommandNumberOption } from "discord.js";
import { Guardsman } from "index";

const pageSize = 5;

export default class QueueCommand implements ICommand {
    name: Lowercase<string> = "queue";
    description: string = "Lists the song queue at the provided page.";
    guardsman: Guardsman;

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    options?: ApplicationCommandOptionBase[] | undefined = [
        new SlashCommandNumberOption()
            .setName("page")
            .setDescription("The page of the queue to view.")
            .setRequired(true)
            .setAutocomplete(true)
    ]

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await interaction.deferReply();

        const queue = this.guardsman.bot.musicController.queues.get(interaction.guild);
        if (!queue || !queue.currentTrack) {
            await interaction.editReply({
                content: "The queue is empty!"
            });

            return;
        }

        const queuePage = interaction.options.getNumber("page", true);
        const queueSize = queue.size;
        const pages = Math.ceil(queueSize / pageSize);

        if (queuePage > pages) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Music")
                        .setDescription(`You must specify a queue page between 1 and ${pages}.`)
                        .setColor(Colors.Red)
                        .setFooter({ text: "Guardsman Music" })
                        .setTimestamp()
                ]
            });

            return;
        }

        // 1 = 0 - 4
        // 2 = 5 - 9
        // 3 = 10 - 14
        // 4 = 15 - 19

        // (pageSize * requestPage) - pageSize
        // (5 * 1) - 5 = 0
        // (5 * 2) - 5 = 5
        // this is fucking shit

        const startingIndex = (pageSize * queuePage) - pageSize;
        const songs: APIEmbedField[] = []
        for (let i = startingIndex; i < startingIndex + pageSize; i++) {
            const song = queue.tracks.at(i);
            if (song == undefined) break;

            songs.push({
                name: song.title,
                value: `• Requested By: ${song.requestedBy?.username || "Unknown"} \n • Author: ${song.author} \n • URL: ${song.url} \n • Length: ${song.duration} \n • Current Song: ${queue.currentTrack.id == song.id && 'Yes' || 'No'}`
            })
        }

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Guardsman Music")
                    .setDescription(`Now showing songs for queue page ${queuePage}.`)
                    .setColor(Colors.Blurple)
                    .setFooter({ text: "Guardsman Music" })
                    .setTimestamp()
                    .setFields(songs)
            ]
        });
    }

    async autocomplete(interaction: AutocompleteInteraction<"cached">): Promise<void> {
        const queue = this.guardsman.bot.musicController.queues.get(interaction.guild);
        if (!queue || !queue.currentTrack) {
            interaction.respond([
                {
                    name: "The queue is empty!",
                    value: 0
                }
            ]);
            return;
        }

        const queueSize = queue.size;
        const pages = Math.ceil(queueSize / pageSize);
        const response = []

        for (let i = 1; i < pages + 1; i++) {
            response.push({
                name: `Page ${i}`,
                value: i
            })
        }

        interaction.respond(response);
    }
}