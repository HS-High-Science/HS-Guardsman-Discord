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

import chalk from "chalk";
import { Guardsman } from "../index.js";
import moment from "moment";

export default class Logger {
    name: string;
    guardsman: Guardsman;

    constructor(name: string, guardsman: Guardsman) {
        this.name = name;
        this.guardsman = guardsman;
    }

    _base = async (type: string, ...args: any[]) => {
        console.log(
            `${chalk.gray("[")} ${chalk.blueBright(this.name)} ${chalk.gray(":")} ${type} ${chalk.gray("]")}` +
            `${chalk.gray("[")} ${chalk.greenBright(moment().format("hh:mm:ss"))} ${chalk.gray("]")}` +
            `: ${args.join(", ")}`
        )
    }

    info = async (...args: any[]) => {
        await this._base(chalk.blueBright("INFO"), ...args);
    }

    warn = async (...args: any[]) => {
        await this._base(chalk.yellowBright("WARN"), ...args);
    }

    error = async (...args: any[]) => {
        await this._base(chalk.redBright("ERROR"), ...args);
    }

    critical = async (...args: any[]) => {
        await this._base(chalk.red("CRITICAL"), ...args);
    }

    debug = async (...args: any[]) => {
        if (!this.guardsman.debug) return;
        await this._base(chalk.greenBright("DEBUG"), ...args);
    }

}