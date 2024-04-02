import { Colors, EmbedBuilder } from "discord.js";
import { Guardsman } from "index";

export default async (guardsman: Guardsman, discordId: string) =>
{
    const interaction = guardsman.bot.pendingVerificationInteractions[discordId];

    try 
    {
        const reply = await interaction.editReply({
            components: [],
    
            embeds: [
            new EmbedBuilder()
                .setTitle(`Guardsman Verification`)
                .setDescription(
                    "Discord account verification was successful! Please run `/update` to obtain roles."
                )
                .setColor(Colors.Green)
                .setTimestamp()
                .setFooter({
                    text: "Guardsman Verification"
                }),
            ],
        });
    
        //await reply.reply(`<@${interaction.member.id}>`) // Errors.
    } 
    catch (error) 
    {
        guardsman.log.warn(`Failed to respond to interaction ${interaction.id}`)
    }
}