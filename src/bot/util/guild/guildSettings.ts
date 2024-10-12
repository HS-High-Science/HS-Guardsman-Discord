/**
 *  Copyright (C) 2024 Bunker Bravo Interactive LLC

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.

 */

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

export async function getSettings(guardsman: Guardsman, guild: Guild): Promise<GuildSettings> {
    const guildSettings = await guardsman.configuration.getGuildSettings(guild.id);

    const defaultBuiltSettings = returnDefaultSettings();
    if (!guildSettings || !guildSettings.settings) {
        return defaultBuiltSettings as GuildSettings;
    }

    return { ...defaultBuiltSettings, ...JSON.parse(guildSettings.settings) };
}

export async function updateSetting(guardsman: Guardsman, guild: Guild, name: keyof typeof defaultSettings, value: typeof defaultSettings[keyof typeof defaultSettings]["default"]): Promise<void> {
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

export { defaultSettings };