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

}

async function getSetting(guardsman: Guardsman, guild: Guild, name: keyof typeof defaultSettings): Promise<boolean | string | number> {
    const guildSettings = await guardsman.configuration.getSettings(guild.id);

    if (!guildSettings || !guildSettings.settings) {
        return defaultSettings[name];
    }

    const settings = JSON.parse(guildSettings.settings);

    if (settings[name] === undefined) {
        return defaultSettings[name];
    } else {
        return settings[name];
    }
}

async function updateSetting(guardsman: Guardsman, guild: Guild, name: keyof typeof defaultSettings, value: boolean | string | number): Promise<void> {
    const guildSettings = await guardsman.configuration.getSettings(guild.id);

    if (!guildSettings || !guildSettings.settings) {
        const newSettings: typeof defaultSettings = { ...defaultSettings };
        (newSettings as any)[name] = value;

        await guardsman.configuration.updateSetting(guild.id, {
            settings: JSON.stringify(newSettings)
        });
    } else {
        const settings = JSON.parse(guildSettings.settings);
        settings[name] = value;

        await guardsman.configuration.updateSetting(guild.id, {
            settings: JSON.stringify(settings)
        });
    }
}

export {
    getSetting,
    updateSetting,
    defaultSettings
}