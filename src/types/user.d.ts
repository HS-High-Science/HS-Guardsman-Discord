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

declare interface IUser {
    id?: number
    username: string
    roblox_id: string
    discord_id: string
    password?: string
    remember_token?: string
    roles: string
    created_at?: Date
    updated_at?: Date
}

declare interface IAPIUser {
    id: number
    username: string
    roblox_id: string
    discord_id: string
    roles: string
    game_data: string
    rollback_points: string
    roles: string
    permissions: { [node: string]: boolean }
    role: IRole
    position: number
    created_at?: Date
    updated_at?: Date
}

declare interface IRole {
    name: string
    position: number
    permissions: string
}

declare interface IVerificationConfirmation {
    discord_id: string
    token: string
}

declare interface IRoleBind {
    id: number,
    guild_id: string,
    role_id: string,
    role_data: string
}

declare type RoleDataGroupBind =
    {
        groupId?: number
        minRank?: number,
        maxRank?: number,
    }

declare type RoleDataUserBind =
    {
        userId?: string
    }

declare type RoleDataGamePassBind =
    {
        gamepassId?: number
    }

declare type RoleDataBadgeBind =
    {
        badgeId?: number
    }

declare type RoleData<T> =
    {
        type: string
    } & T

declare type Userdata =
    {
        user_id: string,
        in_squadron: number,
        events_attended: number,
        squadron_events_attended: number,
        squadron_last_promoted?: Date,
        squadron_medals: string,
        squadron_loa_start_date?: Date,
    }

declare type StoredUserdata =
    {
        created_at: Date,
        updated_at: Date
    } & Userdata