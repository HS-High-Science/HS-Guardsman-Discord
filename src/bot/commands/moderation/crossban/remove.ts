import { ChatInputCommandInteraction, Colors, EmbedBuilder, SlashCommandUserOption } from "discord.js";
import { Guardsman } from "index";

export default class CrossBanRemoveCommand implements ICommand {
    name: Lowercase<string> = "remove";
    description: string = "Allows Guardsman moderators to uncross ban a user from ALL Guardsman-controlled guilds.";
    guardsman: Guardsman;

    options = [
        new SlashCommandUserOption()
            .setName("user")
            .setDescription("The Discord ID of the user to uncross ban")
            .setRequired(true),
    ]

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await interaction.deferReply();

        const discordId = interaction.options.getUser("user", true).id;

        const canGlobalBan = await this.guardsman.userbase.checkPermissionNode(interaction.user, "moderate:moderate");

        if (!canGlobalBan) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman API")
                        .setDescription("You do not have permission to `moderate:moderate`")
                        .setColor(Colors.Red)
                        .setFooter({ text: "Guardsman API" })
                        .setTimestamp()
                ]
            });

            return;
        };

        let userData: any;

        try {
            userData = await this.guardsman.backend.get(`discord/user/by-discord/${discordId}`);
        }
        catch (error) { }

        const executingPosition = await this.guardsman.userbase.getPermissionLevel(interaction.member.user);
        if (userData != undefined && userData.data.position >= executingPosition) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Moderation")
                        .setDescription(`Your permission level is not high enough to cross ban ${userData.data.username}. (${executingPosition}=>${userData.data.position})`)
                        .setColor(Colors.Red)
                        .setFooter({ text: "Guardsman API" })
                        .setTimestamp()
                ]
            })

            return;
        }

        const guilds = this.guardsman.bot.guilds.cache.values();
        const errors = [];
        for (const guild of guilds) {
            try {
                await guild.bans.remove(discordId);
            }
            catch (error) {
                errors.push(error);
            }
        }

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Guardsman Moderation")
                    .setDescription(`<@${discordId}>(${discordId}) has been globally unbanned from all Guardsman-controlled guilds.`)
                    .setColor(Colors.Green)
                    .setFooter({ text: "Guardsman Moderation" })
                    .setTimestamp()
                    .addFields(
                        {
                            name: "Errors",
                            value: errors.length > 0 && errors.join(",\n") || "None."
                        }
                    )
            ]
        })
    }
}