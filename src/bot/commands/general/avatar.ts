import { ChatInputCommandInteraction, EmbedBuilder, Colors, ApplicationCommandOptionBase, SlashCommandUserOption } from "discord.js";
import { Guardsman } from "index";

export default class AvatarCommand implements ICommand {
    name: Lowercase<string> = "avatar";
    description: string = "Get the avatar of a user.";
    guardsman: Guardsman;

    options: ApplicationCommandOptionBase[] = [
        new SlashCommandUserOption()
            .setName("user")
            .setDescription("User to get the avatar of.")
            .setRequired(true),
    ];

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const user = interaction.options.getUser("user", true);

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`${user.username}'s Avatar`)
                    .setColor(Colors.Green)
                    .setImage(user.displayAvatarURL({ size: 4096, forceStatic: false, extension: "png" }))
                    .setFooter({ text: "Guardsman Discord" })
                    .setTimestamp()
            ]
        });
    }
}