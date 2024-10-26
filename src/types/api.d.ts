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

declare type GuardsmanPermissionNode =
  "moderate:moderate"
  | "moderate:search"
  | "manage:manage"
  | "manage:servers"
  | "manage:exploit-logs"
  | "development:development"
  | "development:source-control"
  | "development:error-tracking"
  | "development:remote-execute"
  | "administrate:administrate"
  | "administrate:manage-panel"
  | "administrate:make-user"
  | "administrate:manage-group"
  | "game:canBan"
  | "game:canExecuteCC"
  | "game:canGiveEffects"
  | "game:canGiveTools"
  | "game:canKick"
  | "game:canLockServer"
  | "game:canUnban"

declare interface IAPIPunishmentData {
  success: boolean
  id: string
}