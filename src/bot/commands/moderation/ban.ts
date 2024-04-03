import { ChatInputCommandInteraction, Colors, EmbedBuilder, PermissionFlagsBits, SlashCommandMentionableOption, SlashCommandStringOption } from "discord.js";
import { Guardsman } from "index";

export default class BanCommand implements ICommand 
{
    name: Lowercase<string> = "ban";
    description: string = "Allows Guild moderators to ban a user from this guild.";
    guardsman: Guardsman;
    defaultMemberPermissions?: string | number | bigint | null | undefined = PermissionFlagsBits.BanMembers;

    options = [
        new SlashCommandMentionableOption()
            .setName("user")
            .setDescription("The user to ban (To find, run /searchuser)")
            .setRequired(true),

        new SlashCommandStringOption()
            .setName("reason")
            .setDescription("The reason for the ban")
            .setRequired(false),
    ]

    constructor(guardsman: Guardsman) 
    {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void>
    {
        await interaction.deferReply();

        const banReason = interaction.options.getString("reason", false);
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

        // send ban dm to user
        try 
        {
            const user = await this.guardsman.bot.users.cache.find(user => user.id === member.id);
            if (!user) throw new Error("User could not be messaged.");

            await user.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Moderation")
                        .setThumbnail(`${interaction.guild.iconURL()}`)
                        .setDescription(`You have been **banned** from ${interaction.guild.name}.`)
                        .setColor("#A30101")
                        .setFooter({ text: "Guardsman Moderation", iconURL: "https://cdn.astrohweston.xyz/u/mej89O.png"})
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

        try 
        {
            await interaction.guild.bans.create(member.id, {
                reason: (banReason || `No reason provided.`) + `; Executed by: ${interaction.member.nickname}`
            });
        } 
        catch (error) 
        {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Moderation")
                        .setDescription(`Failed to ban <@${member.id}>. ${error}`)
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
                        .setDescription(`${member.user.username} has been banned from the guild.`)
                        .setColor(Colors.Red)
                        .setFooter({ text: "Guardsman Moderation"})
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
}
