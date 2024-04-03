import {
    ChatInputCommandInteraction,
    Colors,
    EmbedBuilder,
    PermissionFlagsBits,
    SlashCommandStringOption,
    SlashCommandUserOption
} from "discord.js";
import { Guardsman } from "index";

export default class KickCommand implements ICommand 
{
    name: Lowercase<string> = "kick";
    description: string = "Allows Guild moderators to kick a user from this guild.";
    guardsman: Guardsman;
    defaultMemberPermissions?: string | number | bigint | null | undefined = PermissionFlagsBits.KickMembers;

    options = [
        new SlashCommandUserOption()
            .setName("user")
            .setDescription("The user to kick (To find, run /searchuser)")
            .setRequired(true),

        new SlashCommandStringOption()
            .setName("reason")
            .setDescription("The reason for the kick")
            .setRequired(false),
    ]

    constructor(guardsman: Guardsman) 
    {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void>
    {
        await interaction.deferReply();

        const kickReason = interaction.options.getString("reason", false);
        const member = interaction.options.getMember("user");

        if (!member) 
        {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Moderation")
                        .setDescription("No member was found.")
                        .setColor(Colors.Red)
                        .setFooter({ text: "Guardsman Moderation" })
                        .setTimestamp()
                ]
            });

            return;
        }

        // send kick dm to user
        try 
        {
            const user = await this.guardsman.bot.users.cache.find(user => user.id === member.id);
            if (!user) throw new Error("User could not be messaged.");

            await user.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Moderation")
                        .setThumbnail(`${interaction.guild.iconURL()}`)
                        .setDescription(`You have been **kicked** from ${interaction.guild.name}.`)
                        .setColor(Colors.Red)
                        .setFooter({ text: "Guardsman Moderation", iconURL: "https://cdn.astrohweston.xyz/u/mej89O.png" })
                        .setTimestamp()
                        .addFields(
                            {
                                name: "Reason",
                                value: kickReason || "No Reason Provided"
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
                        .setDescription(`Failed to send kick DM. ${error}`)
                        .setColor(Colors.Orange)
                        .setFooter({ text: "Guardsman API" })
                        .setTimestamp()
                ]
            });
        }

        try 
        {
            await member.kick((kickReason || `No reason provided.`) + `; Executed by: ${interaction.member.user.username}`)
        } 
        catch (error) 
        {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Moderation")
                        .setDescription(`Failed to kick <@${member.id}>. ${error}`)
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
                        .setDescription(`${member.user.username} has been kicked from the guild.`)
                        .setColor(Colors.Red)
                        .setFooter({ text: "Guardsman Moderation"})
                        .setTimestamp()
                        .addFields(
                            {
                                name: "Reason",
                                value: kickReason || "No Reason Provided"
                            }
                        )
            ]
        })
    }
}
