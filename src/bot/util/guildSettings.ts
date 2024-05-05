import { Guild } from "discord.js";
import { Guardsman } from "../../index.js";

const defaultSettings = {

    // Verification
    allowVerification: true,
    accountAge: 0,

    // Updating
    allowUpdating: true,
    autoUpdateOnJoin: true,
    autoUpdateOnVerification: false,
    changeNicknameToRobloxName: true,

    // PerGuild
    globalBanExcluded: false,
    guildInfoMessageChannelID: "",
    joinMessageContent: "**Welcome to {server}, {user}!**",
    joinMessageCard: false,
    leaveMessageContent: "**Goodbye, {user}!**",
    banMessage: "You have been **banned** from {server}!",
    crossBanMessage: "You have been **globally banned** from ALL Guardsman-controlled guilds.",
    globalBanMessage: "You have been **globally banned** from ALL Guardsman - controlled guilds, and ALL Guardsman - controlled experiences.",
    kickMessage: "You have been **kicked** from {server}!",

}

async function getSettings(guardsman: Guardsman, guild: Guild): Promise<typeof defaultSettings> {
    const guildSettings = await guardsman.configuration.getGuildSettings(guild.id);

    if (!guildSettings || !guildSettings.settings) {
        return defaultSettings;
    }

    const settings = JSON.parse(guildSettings.settings);

    return { ...defaultSettings, ...settings };
}

async function updateSetting(guardsman: Guardsman, guild: Guild, name: keyof typeof defaultSettings, value: boolean | string | number): Promise<void> {
    const guildSettings = await guardsman.configuration.getGuildSettings(guild.id);

    if (!guildSettings || !guildSettings.settings) {
        const newSettings: typeof defaultSettings = { ...defaultSettings };
        (newSettings as any)[name] = value;

        await guardsman.configuration.pushGuildSettings(guild.id, {
            settings: JSON.stringify(newSettings)
        });
    } else {
        const settings = JSON.parse(guildSettings.settings);
        settings[name] = value;

        await guardsman.configuration.pushGuildSettings(guild.id, {
            settings: JSON.stringify(settings)
        });
    }
}

export {
    getSettings,
    updateSetting,
    defaultSettings
}