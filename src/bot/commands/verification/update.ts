import { ChatInputCommandInteraction, Colors, EmbedBuilder } from "discord.js";
import { Guardsman } from "index";
import Noblox from "noblox.js";
import axios from "axios";

export default class UpdateCommand implements ICommand
{
    name: Lowercase<string> = "update";
    description: string = "Allows users to update their Discord roles.";
    guardsman: Guardsman;

    constructor(guardsman: Guardsman)
    {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const member = interaction.member;
        const guild = interaction.guild;

        const existingUserData = await this.guardsman.database<IUser>("users")
            .where("discord_id", member.id)
            .first();

        if (!existingUserData) 
        {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Verification")
                        .setDescription("You must be verified with Guardsman (`/verify`) to update your roles!")
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({text: "Guardsman Verification"})
                ]
            })

            return;
        }

        const verificationBinds = await this.guardsman.database<IRoleBind>("verification_binds")
            .where("guild_id", guild.id);

        const roleCache: { [groupId: number]: number } = {};
        const allowedRoles: IRoleBind[] = [];
        const removedRoles: IRoleBind[] = [];
        const errors: string[] = [];

        // see if guild has verified / unverified roles;
        const verifiedRole = guild.roles.cache.find(role => role.name.includes("Verified") && !role.name.includes("Unverified"));
        const unverifiedRole = guild.roles.cache.find(role => role.name.includes("Unverified"));
        
        if (verifiedRole) allowedRoles.push({
            id: -1,
            guild_id: guild.id,
            role_id: verifiedRole.id,
            role_data: ""
        });

        if (unverifiedRole) removedRoles.push({
            id: -1,
            guild_id: guild.id,
            role_id: unverifiedRole.id,
            role_data: ""
        });

        // parse allowed roles
        for (const verificationBind of verificationBinds) 
        {
            const bindData: RoleData<any> = JSON.parse(verificationBind.role_data);

            const type = bindData.type;
            try 
            {
                switch (type) 
                {
                    case "group":
                        const groupId = bindData.groupId;
                        const minimumRank = bindData.minRank;
                        const maxRank = bindData.maxRank;

                        let userRank = roleCache[groupId];
                        if (!userRank) 
                        {
                            userRank = await Noblox.getRankInGroup(groupId, parseInt(existingUserData.roblox_id));
                            roleCache[groupId] = userRank;
                        }

                        if (userRank >= minimumRank && userRank <= maxRank) 
                        {
                            allowedRoles.push(verificationBind);
                        }

                        break;
                    case "user":
                        const userId = bindData.userId;

                        if (userId == existingUserData.roblox_id || userId == existingUserData.discord_id) 
                        {
                            allowedRoles.push(verificationBind);
                        }

                        break;
                    case "gamepass":
                        const gamepassId = bindData.gamepassId;
                        let userOwnsGamepass = false;

                        try 
                        {
                            console.log(existingUserData.roblox_id);
                            console.log(gamepassId);
                            const apiUrl = `https://inventory.roblox.com/v1/users/${existingUserData.roblox_id}/items/1/${gamepassId}/is-owned`
                            const returnedApiData = await axios.get(apiUrl);
                            console.log(returnedApiData);
                            userOwnsGamepass = returnedApiData.data == "true";
                        } 
                        catch (error: any) 
                        {
                            console.log(error);
                            errors.push(error);
                        }

                        if (userOwnsGamepass) 
                        {
                            allowedRoles.push(verificationBind);
                        }

                        break;
                    case "role":
                        const canAddRole = member.roles.resolve(verificationBind.role_id)
                            || allowedRoles.find(role => role.role_id == verificationBind.role_id);

                        if (canAddRole != null) 
                        {
                            allowedRoles.push(verificationBind);
                        }

                        break;
                    case "default":
                        allowedRoles.push(verificationBind);

                        break;
                    default:
                        errors.push(`Unknown bind type ${type}. Please contact a guild administrator.`);
                }
            } 
            catch (error) 
            {
                console.log(error);
                errors.push(`Failed to apply a role. ${error}`);
            }
        }

        // scan user's current roles and verify they are allowed to have them
        for (const role of member.roles.cache.keys())
        {
            const isBoundRole = (verificationBinds.find(r => r.role_id == role && r.guild_id == guild.id)) != null
            const allowedRole = allowedRoles.find(r => r.role_id == role);

            if (!allowedRole && isBoundRole)
            {
                removedRoles.push({
                    id: -1,
                    guild_id: guild.id,
                    role_data: "",
                    role_id: role,
                })
            }
        }

        // ensure no allowed roles are in the removedRoles list
        for (const removedRole of removedRoles) 
        {
            if (allowedRoles.includes(removedRole)) 
            {
                removedRoles.splice(removedRoles.indexOf(removedRole), 1);
            }
        }

        // remove roles
        for (const removedRole of removedRoles)
        {
            const userRole = member.roles.resolve(removedRole.role_id);
            if (userRole)
            {
                try
                {
                    await member.roles.remove(removedRole.role_id);
                }
                catch (error: any)
                {
                    errors.push(error);
                }
            }
        }

        // add roles
        for (const allowedRole of allowedRoles)
        {
            const userRole = member.roles.resolve(allowedRole.role_id);
            if (!userRole)
            {
                const guildRole = guild.roles.resolve(allowedRole.role_id);
                if (!guildRole)
                {
                    errors.push(`Failed to find role for bind ${allowedRole.id}`);
                    continue;
                }

                try
                {
                    await member.roles.add(guildRole);
                }
                catch (error: any)
                {
                    errors.push(error);
                }
            }
        }

        await member.setNickname(existingUserData.username);

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Guardsman Verification")
                    .setDescription(`Role update complete. See details below.`)
                    .setColor(errors.length > 0 && Colors.Orange || Colors.Green)
                    .setTimestamp()
                    .setFooter({ text: "Guardsman Verification" })
                    .addFields(
                        {
                          name: "Username changed to",
                          value: `${existingUserData.username}`,
                        },
                        {
                            name: "Added Roles",
                            value: `${allowedRoles.length > 0 && "• " || "None."}${allowedRoles.map(r => "<@&" + r.role_id + '>').join("\n • ")}`
                        },

                        {
                            name: "Removed Roles",
                            value: `${removedRoles.length > 0 && "• " || "None."}${removedRoles.map(r => "<@&" + r.role_id + '>').join("\n •")}`
                        },

                        {
                            name: "Errors",
                            value: errors.length > 0 && errors.join("\n") || "None."
                        }
                    )
            ]
        })
    }
}
