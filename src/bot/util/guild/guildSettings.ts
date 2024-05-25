import { Guild } from "discord.js";
import { Guardsman } from "../../../index.js";
import defaultSettings from "./guildSettingsList.js";

type GuildSettings = {
    [Key in keyof typeof defaultSettings]: typeof defaultSettings[Key]["default"];
}

function returnDefaultSettings(): GuildSettings {
    let defaultBuiltSettings: { [key: string]: any } = {};
    for (const setting in defaultSettings) {
        defaultBuiltSettings[setting] = defaultSettings[setting as keyof typeof defaultSettings].default;
    }

    return defaultBuiltSettings as GuildSettings;
}

async function getSettings(guardsman: Guardsman, guild: Guild): Promise<GuildSettings> {
    const guildSettings = await guardsman.configuration.getGuildSettings(guild.id);

    const defaultBuiltSettings = returnDefaultSettings();
    if (!guildSettings || !guildSettings.settings) {
        return defaultBuiltSettings as GuildSettings;
    }

    return { ...defaultBuiltSettings, ...JSON.parse(guildSettings.settings) };
}

async function updateSetting(guardsman: Guardsman, guild: Guild, name: keyof typeof defaultSettings, value: typeof defaultSettings[keyof typeof defaultSettings]["default"]): Promise<void> {
    const guildSettings = await guardsman.configuration.getGuildSettings(guild.id);

    if (!guildSettings || !guildSettings.settings) {
        const newSettings: GuildSettings = { ...returnDefaultSettings() };
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