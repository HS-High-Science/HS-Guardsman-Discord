import { AutocompleteInteraction, ChatInputCommandInteraction, Colors, EmbedBuilder, SlashCommandStringOption } from "discord.js";
import { Guardsman } from "index";
import axios from "axios";

interface IRobloxUser {
    previousUsernames: string[],
    hasVerifiedBadge: boolean,
    id: number,
    name: string,
    displayName: string
}

interface IUserSearchResponse {
    data: IRobloxUser[]
}

export default class FindUserCommand implements ICommand {
    name: Lowercase<string> = "finduser";
    description: string = "Allows guild moderators to search for a user's ROBLOX profile";
    guardsman: Guardsman;

    options = [
        new SlashCommandStringOption()
            .setName("username")
            .setDescription("ROBLOX username")
            .setRequired(true)
            .setAutocomplete(true)
    ]

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await interaction.deferReply();

        const query = interaction.options.getString("username", true);

        await axios.post<IUserSearchResponse>(`https://users.roblox.com/v1/usernames/users/`, {
            usernames: [query],
            excludeBannedUsers: false
        },
            {
                headers: {
                    Cookie: `.ROBLOSECURITY=${this.guardsman.environment.ROBLOX_COOKIE}`
                }
            })
            .then(async response => {
                const user = response.data.data[0];

                const Headshot = await this.guardsman.roblox.getPlayerThumbnail(user.id, "420x420", "png", false, "headshot").then(Headshot => Headshot[0].imageUrl + ".png");

                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(user.name)
                            .setColor(Colors.Green)
                            .setFooter({ text: "Guardsman Database" })
                            .setTimestamp()
                            .setThumbnail(Headshot)
                            .addFields(
                                {
                                    name: "Username",
                                    value: user.name,
                                    inline: true
                                },

                                {
                                    name: "ROBLOX ID",
                                    value: user.id.toString(),
                                    inline: true
                                },

                                {
                                    name: "Profile Link",
                                    value: `https://www.roblox.com/users/${user.id}/profile`,
                                    inline: true
                                }
                            )
                    ]
                })
            })
            .catch(async response => {
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Guardsman Moderation")
                            .setDescription(`An error occurred whilst fetching the user. ${response}`)
                            .setColor(Colors.Red)
                            .setFooter({ text: "ROBLOX API" })
                            .setTimestamp()
                    ]
                })
            })
    }

    async autocomplete(interaction: AutocompleteInteraction<"cached">): Promise<void> {
        const query = interaction.options.getString("username", true);
        if (query == "") return;

        await axios.get<IUserSearchResponse>(`https://users.roblox.com/v1/users/search?keyword=${query}&limit=10`, {
            headers: {
                Cookie: `.ROBLOSECURITY=${this.guardsman.environment.ROBLOX_COOKIE}`
            }
        })
            .then(response => {
                interaction.respond(response.data.data.map(user => { return { name: user.name, value: user.name } }));
            })
            .catch(response => {
                interaction.respond([])
            })
    }
}