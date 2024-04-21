import { Guardsman } from "index";
import {
    ApplicationCommandOptionBase,
    ChatInputCommandInteraction, Colors, EmbedBuilder,
    SlashCommandRoleOption, PermissionFlagsBits
} from "discord.js";

export default class BindUserSubcommand implements ICommand {
    name: Lowercase<string> = "default";
    description: string = "Allows guild administrators to bind a post-verification default role.";
    guardsman: Guardsman;
    defaultMemberPermissions = PermissionFlagsBits.ManageRoles;
    options: ApplicationCommandOptionBase[] = [
        new SlashCommandRoleOption()
            .setName("role")
            .setDescription("The role to bind to.")
            .setRequired(true)
    ];

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const options = interaction.options;
        const guild = interaction.guild;

        const guildRole = options.getRole("role", true);

        // validate role settings
        const groupRoleBind: RoleData<any> = {
            type: "default"
        }

        const existingRole = await this.guardsman.database<IRoleBind>("verification_binds")
            .where({
                guild_id: guild.id,
                role_id: guildRole.id,
                role_data: JSON.stringify(groupRoleBind)
            })
            .first();

        if (existingRole) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Database")
                        .setDescription(`A default role bind for <@&${guildRole.id}> with those properties already exists.`)
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({ text: "Guardsman Database" })
                ]
            });

            return;
        }

        await this.guardsman.database<IRoleBind>("verification_binds")
            .insert({
                guild_id: guild.id,
                role_id: guildRole.id,
                role_data: JSON.stringify(groupRoleBind)
            });

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`Guardsman Database`)
                    .setDescription(`Successfully added a default bind for <@&${guildRole.id}>.`)
                    .setColor(Colors.Green)
                    .setTimestamp()
                    .setFooter({ text: "Guardsman Database" })
            ]
        })
    }
}