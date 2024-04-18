import { Guardsman } from "index";
import { GuildMember } from "discord.js";
import { updateUser } from "../util/user.js"
import { getSetting } from "../util/guildSettings.js";

export default async (guardsman: Guardsman, member: GuildMember) => {
    try {
        const guild = member.guild;

        const autoUpdate = await getSetting(guardsman, guild, "autoUpdateOnJoin");

        if (!autoUpdate) {
            return;
        }

        const existingUserData = await guardsman.database<IUser>("users")
            .where("discord_id", member.id)
            .first();

        if (!existingUserData) {
            return;
        }

        await updateUser(guardsman, guild, member, existingUserData);
    } catch (error) { }
}