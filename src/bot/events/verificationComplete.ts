import { Colors, EmbedBuilder } from "discord.js";
import { Guardsman } from "index";
import { updateUser } from "../util/user.js";
import { getSetting } from "../util/guildSettings.js";

export default async (guardsman: Guardsman, discordId: string) => {
    const interaction = guardsman.bot.pendingVerificationInteractions[discordId];

    const autoUpdateOnVerification = await getSetting(guardsman, interaction.guild, "autoUpdateOnVerification");

    try {
        if (autoUpdateOnVerification) {
            const userInGuild = await interaction.guild.members.fetch(interaction.member.id).catch(() => null);

            const existingData = await guardsman.database<IUser>("users")
                .where({
                    discord_id: interaction.member.id
                })
                .first();

            if (existingData && userInGuild) {
                await updateUser(guardsman, interaction.guild, userInGuild, existingData)

                return;
            }
        }

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
    catch (err) { }
}