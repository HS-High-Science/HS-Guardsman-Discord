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

import { Colors, EmbedBuilder, Interaction } from "discord.js";
import { Guardsman } from "index";

export default async (guardsman: Guardsman, interaction: Interaction<"cached">) => {
    if (!interaction.guild) return;

    if (interaction.isChatInputCommand()) {
        const sentCommand = interaction.commandName;
        const options = interaction.options;
        let command: ICommand | undefined;

        guardsman.bot.commands.list.find(category => {
            command = category.find(com => com.name == sentCommand)
            return command;
        })

        if (!command) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Command Execution Error")
                        .setDescription(`No command was found matching name \`${sentCommand}\`.`)
                        .setColor(Colors.Red)
                ]
            })
        }

        const subCommand = options.getSubcommand(false);
        if (subCommand) {
            command = command.subcommands?.find(subCom => subCom.name == subCommand);
        }

        if (!command) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Command Execution Error")
                        .setDescription(`No subcommand was found matching name \`${sentCommand}\`.`)
                        .setColor(Colors.Red)
                ]
            })
        }

        if (command.developer && !guardsman.environment.DISCORD_BOT_OWNER_IDS.includes(interaction.user.id)) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Command Execution Error")
                        .setDescription(`You do not have permission to execute this command.`)
                        .setColor(Colors.Red)
                ]
            })
        }

        if (typeof command.defaultMemberPermissions == "bigint" && !interaction.member.permissions.has(command.defaultMemberPermissions)) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Command Execution Error")
                        .setDescription(`You do not have permission to execute this command.`)
                        .setColor(Colors.Red)
                ]
            })
        }

        try {
            await command.execute(interaction);
        }
        catch (error) {
            const replied = interaction.replied || interaction.deferred;
            const replyData = {
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Command Execution Error")
                        .setDescription(`${error}`)
                        .setColor(Colors.Red)
                ]
            }

            if (replied) {
                return interaction.editReply(replyData)
            }
            else {
                return interaction.reply(replyData);
            }
        }
    }
    else if (interaction.isAutocomplete()) {
        const sentCommand = interaction.commandName;
        const options = interaction.options;
        let command: ICommand | undefined;

        guardsman.bot.commands.list.find(category => {
            command = category.find(com => com.name == sentCommand)
            return command;
        })

        if (!command) return;

        const subCommand = options.getSubcommand(false);
        if (subCommand) {
            command = command.subcommands?.find(subCom => subCom.name == subCommand);
        }

        if (!command || !command.autocomplete) return;

        await command.autocomplete(interaction);
    }
}
