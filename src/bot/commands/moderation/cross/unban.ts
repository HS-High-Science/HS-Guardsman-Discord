import { AxiosResponse } from "axios";
import { ChatInputCommandInteraction, Colors, EmbedBuilder, SlashCommandIntegerOption, SlashCommandStringOption } from "discord.js";
import { Guardsman } from "index";

export default class CrossUnbanSubcommand implements ICommand
{
    name: Lowercase<string> = "unban";
    description: string = "Allows Guardsman moderators to unban a user from ALL Guardsman-controlled servers.";
    guardsman: Guardsman;

    options = [
        new SlashCommandStringOption()
            .setName("id")
            .setDescription("The Discord ID of the user to unban.")
            .setRequired(true),

        new SlashCommandStringOption()
            .setName("reason")
            .setDescription("The reason for the unban.")
            .setRequired(false)
    ]

    constructor(guardsman: Guardsman)
    {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void>
    {
        await interaction.deferReply();

        const discordId = interaction.options.getString("id", true);
        const unbanReason = interaction.options.getString("reason", false);

        const canGlobalBan = await this.guardsman.userbase.checkPermissionNode(interaction.user, "moderate:moderate");

        if (!canGlobalBan)
        {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman API")
                        .setDescription("You do not have permission to `moderate:moderate`.")
                        .setColor(Colors.Red)
                        .setFooter({ text: "Guardsman API" })
                        .setTimestamp()
                ]
            });

            return;
        };

        let userData: any;

        try
        {
            userData = await this.guardsman.backend.get(`discord/user/by-discord/${discordId}`);
        }
        catch (error)
        {}

        const executingPosition = await this.guardsman.userbase.getPermissionLevel(interaction.member.user);
        if (userData != undefined && userData.data.position >= executingPosition)
        {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Moderation")
                        .setDescription(`Your permission level is not high enough to cross ban ${userData.data.username}. (${executingPosition}=>${userData.data.position}).`)
                        .setColor(Colors.Red)
                        .setFooter({ text: "Guardsman API" })
                        .setTimestamp()
                ]
            })

            return;
        }

        // send ban dm to user
        try
        {
            const user = await this.guardsman.bot.users.cache.find(user => user.id === discordId);
            if (!user) throw new Error("User could not be messaged.");

            await user.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Moderation")
                        .setDescription("You have been **unbanned** from ALL Guardsman-controlled guilds.")
                        .setColor(Colors.Red)
                        .setFooter({ text: "Guardsman Moderation"})
                        .setTimestamp()
                        .addFields(
                            {
                                name: "Reason",
                                value: unbanReason || "No Reason Provided"
                            }
                        )
                ]
            })
        }
        catch (error)
        {
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
        for (const guild of guilds)
        {
            try
            {
                await guild.bans.remove(discordId, unbanReason || `No reason provided.` + `; Executed by: ${interaction.member.nickname}`);
            }
            catch (error)
            {
                errors.push(error);
            }
        }

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Guardsman Moderation")
                    .setDescription(`<@${discordId}> (${discordId}) has been unbanned from across all Guardsman-controlled guilds.`)
                    .setColor(Colors.Red)
                    .setFooter({ text: "Guardsman Moderation"})
                    .setTimestamp()
                    .addFields(
                        {
                            name: "Reason",
                            value: unbanReason || "No Reason Provided"
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
