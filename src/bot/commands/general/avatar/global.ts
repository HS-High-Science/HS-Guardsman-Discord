import { ChatInputCommandInteraction, EmbedBuilder, Colors, ApplicationCommandOptionBase, SlashCommandUserOption, User } from "discord.js";
import { Guardsman } from "index";

function getAvatarURL(user: User, extension: "webp" | "png" | "jpg" | "jpeg" | "gif" | undefined) {
    return user.avatarURL({ size: 4096, forceStatic: false, extension: extension });
}

export default class GlobalAvatarCommand implements ICommand {
    name: Lowercase<string> = "global";
    description: string = "Get the global avatar of a user.";
    guardsman: Guardsman;

    options: ApplicationCommandOptionBase[] = [
        new SlashCommandUserOption()
            .setName("user")
            .setDescription("User to get the global avatar of.")
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
                    .setTitle(`${user.username}'s Global Avatar`)
                    .setColor(Colors.Green)
                    .setImage(user.displayAvatarURL({ size: 4096, forceStatic: false, extension: "png" }))
                    .setDescription(`[Png](${getAvatarURL(user, "png")}) | [Webp](${getAvatarURL(user, "webp")}) | [Jpg](${getAvatarURL(user, "jpg")}) | [Gif](${getAvatarURL(user, "gif")})`)
                    .setTimestamp()
                    .setFooter({ text: "Guardsman Discord" })
            ]
        });
    }
}