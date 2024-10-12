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

import { ChatInputCommandInteraction, Colors, EmbedBuilder, PermissionFlagsBits, SlashCommandStringOption, ApplicationCommandOptionBase, AutocompleteInteraction } from "discord.js";
import { Guardsman } from "index";
import { getSettings, defaultSettings } from "../../../util/guild/guildSettings.js";

export default class SettingsGetCommand implements ICommand {
    name: Lowercase<string> = "get";
    description: string = "Allows Guild managers to view guild settings.";
    guardsman: Guardsman;
    defaultMemberPermissions = PermissionFlagsBits.ManageGuild;

    options: ApplicationCommandOptionBase[] = [
        new SlashCommandStringOption()
            .setName("setting")
            .setDescription("Setting to view")
            .setRequired(true)
            .setAutocomplete(true),
    ]

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await interaction.deferReply();
        const setting = interaction.options.getString("setting", true) as keyof typeof defaultSettings;

        if (defaultSettings[setting] === undefined) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setTitle("Invalid Setting")
                        .setDescription(`The setting \`${setting}\` is not a valid setting.`)
                        .setFooter({ text: "Guardsman Settings" })
                        .setTimestamp()
                ]
            })

            return;
        }

        const value = await getSettings(this.guardsman, interaction.guild).then(settings => settings[setting]);

        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle(`Guardsman Setting - ${setting}`)
            .setDescription(`The value of the setting \`${setting}\` is \`${value}\`.`)
            .setFooter({ text: "Guardsman Settings" })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }

    async autocomplete(interaction: AutocompleteInteraction<"cached">): Promise<void> {
        const query = interaction.options.getString("setting", true);

        const settings = Object.keys(defaultSettings).filter(setting => setting.toLowerCase().includes(query.toLowerCase()));

        await interaction.respond(
            settings ? settings.map(setting => ({ name: setting, value: setting })).slice(0, 24) : []
        );
    }
}
