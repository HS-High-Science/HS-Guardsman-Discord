import { ChatInputCommandInteraction, Colors, EmbedBuilder } from "discord.js";
import { Guardsman } from "index";
import { updateUser } from "../../util/user.js"
import { getSettings } from "../../util/guild/guildSettings.js";

export default class UpdateCommand implements ICommand {
    name: Lowercase<string> = "update";
    description: string = "Allows users to update their Discord roles.";
    guardsman: Guardsman;

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await interaction.deferReply();

        const member = interaction.member;
        const guild = interaction.guild;

        const guildSettings = await getSettings(this.guardsman, guild);

        if (!guildSettings.allowUpdating) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Verification")
                        .setDescription("User updating is currently turned off in this guild!")
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({ text: "Guardsman Verification" })
                ],
                ephemeral: true
            })

            return;
        }

        const existingUserData = await this.guardsman.database<IUser>("users")
            .where("discord_id", member.id)
            .first();

        if (!existingUserData) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Verification")
                        .setDescription("You must be verified with Guardsman (`/verify`) to update your roles!")
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({ text: "Guardsman Verification" })
                ]
            })

            return;
        }

        let userReturn = await updateUser(this.guardsman, guild, member, existingUserData);

        let InfoEmbed = new EmbedBuilder()
            .setTitle("Guardsman Verification")
            .setDescription(`Role update complete. See details below.`)
            .setColor(userReturn.errors.length > 0 && Colors.Orange || Colors.Green)
            .setTimestamp()
            .setFooter({ text: "Guardsman Verification" })
            .addFields(
                {
                    name: "Added Roles",
                    value: `${userReturn.addedRoles.length > 0 && "• " || "None."}${userReturn.addedRoles.map(r => "<@&" + r.role_id + '>').join("\n • ")}`,
                    inline: true
                },

                {
                    name: "Removed Roles",
                    value: `${userReturn.removedRoles.length > 0 && "• " || "None."}${userReturn.removedRoles.map(r => "<@&" + r.role_id + '>').join("\n •")}`,
                    inline: true
                }
            );

        if (userReturn.extra) {
            InfoEmbed.setColor(Colors.Red)
            InfoEmbed.addFields({
                name: "Extra",
                value: userReturn.extra
            });
        }

        if (userReturn.errors.length > 0) {
            InfoEmbed.addFields({
                name: "Errors",
                value: userReturn.errors.join("\n")
            });
        }

        await interaction.editReply({
            embeds: [InfoEmbed]
        })
    }
}