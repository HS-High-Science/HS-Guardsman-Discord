import {
    ChatInputCommandInteraction,
    Colors,
    EmbedBuilder,
    PermissionFlagsBits,
    SlashCommandMentionableOption,
    SlashCommandStringOption,
    SlashCommandUserOption
} from "discord.js";
import { Guardsman } from "index";

export default class BanCommand implements ICommand
{
    name: Lowercase<string> = "unban";
    description: string = "Allows Guild moderators to ban a user from this guild.";
    guardsman: Guardsman;
    defaultMemberPermissions?: string | number | bigint | null | undefined = PermissionFlagsBits.BanMembers;

    options = [
        new SlashCommandUserOption()
            .setName("user")
            .setDescription("The user to unban (Discord ID)")
            .setRequired(true),

        new SlashCommandStringOption()
            .setName("reason")
            .setDescription("The reason for the unban")
            .setRequired(false),
    ]

    constructor(guardsman: Guardsman)
    {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void>
    {
        await interaction.deferReply();

        const unbanReason = interaction.options.getString("reason", false);
        const member = interaction.options.getUser("user");

        if (!member)
        {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Moderation")
                        .setDescription("No user was found.")
                        .setColor(Colors.Red)
                        .setFooter({ text: "Guardsman Moderation" })
                        .setTimestamp()
                ]
            });

            return;
        }

        // send unban dm to user
        try
        {
            const user = await this.guardsman.bot.users.cache.find(user => user.id === member.id);
            if (!user) throw new Error("User could not be messaged.");
            if (interaction.channel)
            {
                const invite = await interaction.guild.invites.create(`${interaction.channel.id}`, { maxUses: 1, unique: true, maxAge: 2592000, reason: `Member unban; Executed by ${interaction.member.nickname}`});
                await user.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Guardsman Moderation")
                            .setDescription(`You have been **unbanned** from ${interaction.guild.name}. Please read the rules thoroughly before you start chatting.
                        You can join rejoin the server [here](${invite}).
                        `)
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
        }
        catch (error)
        {
            await interaction.channel?.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Moderation")
                        .setDescription(`Failed to send unban DM. ${error}`)
                        .setColor(Colors.Orange)
                        .setFooter({ text: "Guardsman API" })
                        .setTimestamp()
                ]
            });
        }

        try
        {
            await interaction.guild.bans.remove(member.id);
        }
        catch (error)
        {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Moderation")
                        .setDescription(`Failed to unban <@${member.id}>. ${error}`)
                        .setColor(Colors.Red)
                        .setFooter({ text: "Guardsman Moderation" })
                        .setTimestamp()
                ]
            });

            return;
        }

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Guardsman Moderation")
                    .setDescription(`${member.username} has been unbanned from the guild.`)
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
}
