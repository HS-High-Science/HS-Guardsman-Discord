import { ChatInputCommandInteraction, Colors, EmbedBuilder, SlashCommandStringOption, SlashCommandUserOption } from "discord.js";
import { Guardsman } from "index";
import { getSettings } from "../../../util/guild/guildSettings.js";
import { addInfoToString } from "../../../util/string.js";


export default class CrossBanCommand implements ICommand {
    name: Lowercase<string> = "add";
    description: string = "Allows Guardsman moderators to cross ban a user from ALL Guardsman-controlled guilds.";
    guardsman: Guardsman;

    options = [
        new SlashCommandUserOption()
            .setName("user")
            .setDescription("The Discord ID of the user to cross ban")
            .setRequired(true),

        new SlashCommandStringOption()
            .setName("reason")
            .setDescription("The reason for the ban")
            .setRequired(false)
    ]

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await interaction.deferReply();

        const discordId = interaction.options.getUser("user", true).id;
        const banReason = interaction.options.getString("reason", false);

        const canGlobalBan = await this.guardsman.userbase.checkPermissionNode(interaction.user, "moderate:moderate");
        const guildSettings = await getSettings(this.guardsman, interaction.guild);

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
        }

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
                        .setDescription(`Your permission level is not high enough to global ban ${userData.data.username}. (${executingPosition}=>${userData.data.position})`)
                        .setColor(Colors.Red)
                        .setFooter({ text: "Guardsman API" })
                        .setTimestamp()
                ]
            })

            return;
        }

        // send ban dm to user
        try {
            const user = await this.guardsman.bot.users.cache.get(discordId);
            if (!user) throw new Error("User could not be messaged.");

            await user.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Moderation")
                        .setDescription(addInfoToString(guildSettings.crossBanMessage, { server: interaction.guild.name }))
                        .setColor(Colors.Red)
                        .setFooter({ text: "Guardsman Moderation" })
                        .setTimestamp()
                        .addFields(
                            {
                                name: "Reason",
                                value: banReason || "No Reason Provided"
                            }
                        )
                ]
            })
        }
        catch (error) {
            await interaction.channel?.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Moderation")
                        .setDescription(`Failed to send ban DM. ${error}`)
                        .setColor(Colors.Orange)
                        .setFooter({ text: "Guardsman API" })
                        .setTimestamp()
                ]
            });
        }

        const guilds = this.guardsman.bot.guilds.cache.values();
        const errors = [];
        for (const guild of guilds) {
            try {
                const guildSettings = await getSettings(this.guardsman, guild);
                if (guildSettings.globalBanExcluded) continue;

                await guild.bans.create(discordId, {
                    reason: (banReason || `No reason provided.`) + `; Executed by: ${interaction.member.user.username}`
                });
            }
            catch (error) {
                errors.push(error);
            }
        }

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Guardsman Moderation")
                    .setDescription(`<@${discordId}>(${discordId}) has been globally banned from all Guardsman-controlled guilds.`)
                    .setColor(Colors.Red)
                    .setFooter({ text: "Guardsman Moderation" })
                    .setTimestamp()
                    .addFields(
                        {
                            name: "Reason",
                            value: banReason || "No Reason Provided"
                        },

                        {
                            name: "Errors",
                            value: errors.length > 0 && errors.join(",\n") || "None."
                        }
                    )
            ]
        })
    }
}
