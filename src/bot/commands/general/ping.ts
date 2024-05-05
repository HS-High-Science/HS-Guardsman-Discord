import { ChatInputCommandInteraction, EmbedBuilder, Colors } from "discord.js";
import { Guardsman } from "index";

export default class PingCommand implements ICommand {
    name: Lowercase<string> = "ping";
    description: string = "Shows the ping of the bot.";
    guardsman: Guardsman;

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const embed = new EmbedBuilder()
            .setDescription("`Pinging...`")
            .setColor(Colors.Yellow);

        const msg = await interaction.reply({
            embeds: [embed],
            fetchReply: true
        });

        const latency = `\`\`\`ini\n[ ${Math.floor(msg.createdTimestamp - interaction.createdTimestamp)}ms ]\`\`\``;
        const apiLatency = `\`\`\`ini\n[ ${Math.round(interaction.client.ws.ping)}ms ]\`\`\``;

        embed
            .setTitle(`Pong! 🏓`)
            .setDescription(null)
            .addFields([
                { name: "Latency", value: latency, inline: true },
                { name: "API Latency", value: apiLatency, inline: true },
            ])
            .setColor(Colors.Green)
            .setTimestamp()
            .setFooter({ text: "Guardsman Discord" });

        msg.edit({ embeds: [embed] });
    }
}
