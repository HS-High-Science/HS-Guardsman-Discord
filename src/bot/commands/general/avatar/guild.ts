import { ChatInputCommandInteraction, EmbedBuilder, Colors, ApplicationCommandOptionBase, SlashCommandUserOption } from "discord.js";
import { Guardsman } from "index";
import axios from "axios";

export default class GuildAvatarCommand implements ICommand {
    name: Lowercase<string> = "guild";
    description: string = "Get the guild avatar of a user.";
    guardsman: Guardsman;

    options: ApplicationCommandOptionBase[] = [
        new SlashCommandUserOption()
            .setName("user")
            .setDescription("User to get the guild avatar of.")
            .setRequired(true),
    ];

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const user = interaction.options.getUser("user", true);

        try {
            let res = await axios.get(`https://discord.com/api/guilds/${interaction.guild.id}/members/${user.id}`, {
                headers: {
                    Authorization: `Bot ${this.guardsman.environment.DISCORD_BOT_TOKEN}`
                }
            });

            if (res.data.avatar !== undefined && res.data.avatar !== null) {
                const base = `https://cdn.discordapp.com/guilds/${interaction.guild.id}/users/${user.id}/avatars/${res.data.avatar}`
                const { headers } = await axios.head(base);

                function getImageEnding(arg1: string, bool: boolean | undefined = false) {
                    if (bool && headers && headers.hasOwnProperty("content-type")) {
                        if (headers["content-type"].includes("image/gif")) {
                            return base + ".gif?size=4096";
                        } else {
                            return base + `.${arg1}?size=4096`;
                        }
                    } else {
                        return base + `.${arg1}?size=4096`;
                    }
                }

                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`${user.username}'s Guild Avatar`)
                            .setColor(Colors.Green)
                            .setImage(getImageEnding(`webp`, true))
                            .setDescription(`[Png](${getImageEnding(`png`)}) | [Webp](${getImageEnding(`webp`)}) | [Jpg](${getImageEnding(`jpg`)}) | [Gif](${getImageEnding(`gif`)})`)
                            .setTimestamp()
                            .setFooter({ text: "Guardsman Discord" })
                    ]
                });
            } else {
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`${user.username}'s Guild Avatar`)
                            .setColor(Colors.Orange)
                            .setDescription(`This user has no guild avatar.`)
                            .setTimestamp()
                            .setFooter({ text: "Guardsman Discord" })
                    ]
                });
            }
        } catch (err) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`Avatar Error`)
                        .setColor(Colors.Red)
                        .setDescription(`An error occured processing this command. Make sure the user is in the guild.`)
                        .setTimestamp()
                        .setFooter({ text: "Guardsman Discord" })
                ]
            });
        }
    }
}