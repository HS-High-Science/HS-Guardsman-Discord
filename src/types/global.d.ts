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

declare interface ICommand {
    name: Lowercase<string>;
    description: string;
    defaultMemberPermissions?: string | number | bigint | null | undefined;
    subcommands?: ICommand[];
    options?: ApplicationCommandOptionBase[];
    developer?: boolean;

    isIndexer?: boolean;
    guardsman: Guardsman;

    execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void>;
    autocomplete?(interaction: AutocompleteInteraction<"cached">): Promise<void>;
}

declare interface IEvent {
    name: string,
    function: () => Promise<void>
}

declare type ChannelConfiguration =
    {
        guild_id: string,
        channel_id: string,
        setting: string
    }

declare type StoredChannelConfiguration =
    {
        id: number,
        created_at: Date,
        updated_at: Date
    } & ChannelConfiguration

declare interface IGuildConfiguration {
    guild_id: string,
    settings?: string,
    moderator_roles?: string,
    muterole?: string,
    created_at: Date,
    updated_at: Date
}