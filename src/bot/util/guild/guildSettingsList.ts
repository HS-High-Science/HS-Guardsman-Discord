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

export default {

    // Verification
    allowVerification: {
        about: "Whether or not to allow verification.",
        default: true
    },
    accountAge: {
        about: "The minimum age of the account in days to be allowed in.",
        default: 0
    },

    // Updating
    allowUpdating: {
        about: "Whether or not to allow users to update their roles.",
        default: true
    },
    autoUpdateOnJoin: {
        about: "Whether or not to automatically update roles on join. User must already be verified.",
        default: true
    },
    autoUpdateOnVerification: {
        about: "Whether or not to automatically update roles on user verification.",
        default: false
    },
    nicknameType: {
        about: "How the users nickname should be set from Roblox.",
        default: "Username",
        options: ["Username", "Display Name", "None"]
    },

    // PerGuild
    globalBanExcluded: {
        about: "Whether or not to exclude this guild from global bans.",
        default: false
    },
    guildInfoMessageChannelID: {
        about: "The channel to send guild info messages to. (Ex. Join and Leave messages)",
        default: ""
    },
    joinMessageContent: {
        about: "The content of the join message.",
        default: "**Welcome to {server}, {user}!**"
    },
    joinMessageCard: {
        about: "Whether or not to send a join message card.",
        default: false
    },
    leaveMessageContent: {
        about: "The content of the leave message.",
        default: "**Goodbye, {user}!**"
    },
    banMessage: {
        about: "The content of the ban message that gets sent to the user.",
        default: "You have been **banned** from {server}!"
    },
    crossBanMessage: {
        about: "The content of the cross-ban message that gets sent to the user.",
        default: "You have been **globally banned** from ALL Guardsman-controlled guilds."
    },
    globalBanMessage: {
        about: "The content of the global ban message that gets sent to the user.",
        default: "You have been **globally banned** from ALL Guardsman - controlled guilds, and ALL Guardsman - controlled experiences."
    },
    kickMessage: {
        about: "The content of the kick message that gets sent to the user.",
        default: "You have been **kicked** from {server}!"
    },

}