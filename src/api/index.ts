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

import express, { Express, NextFunction, Request, Response } from "express";
import { readdir, lstat } from "fs/promises";
import { Guardsman } from "index";
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

type APIObject<T> = {
    list: T,

    parseDirectory: (path: string) => Promise<void>
    read: () => Promise<void>
}

type IRoutesList = { [path: string]: (request: Request, response: Response) => Promise<void> }
type IMiddlewareList = { [path: string]: (request: Request, response: Response, next: NextFunction) => Promise<void> }

export default class API {
    guardsman: Guardsman;
    server: Express;

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
        this.server = express();

        this.boot();
    }

    boot = async () => {
        await this.middleware.read()
        this.guardsman.log.info("Middleware read successfully.")

        await this.routes.read()
        this.guardsman.log.info("Routes read successfully.")

        this.server.get("/", (_, res) => {
            res.json({ success: true, status: "Guardsman REST API online and ready." })
        });

        this.server.listen(this.guardsman.environment.API_PORT)
    }

    routes: APIObject<IRoutesList> = {
        list: {},

        parseDirectory: async (path: string) => {
            const routeFiles = await readdir(path);

            for (let routeFile of routeFiles) {
                const dirStats = await lstat(`${path}/${routeFile}`);

                if (dirStats.isDirectory()) {
                    await this.routes.parseDirectory(`${path}/${routeFile}`);
                }
                else {

                    const routeFunction = ((await import(`.${path.replace(__dirname, "")}/${routeFile}`)).default).bind(null, this.guardsman);

                    routeFile = routeFile.replace(/\.[^/.]+$/, "");
                    const nameComponents = routeFile.split(".");
                    const method = nameComponents[nameComponents.length - 1];
                    const route = (`${path.replace(`${__dirname}/routes`, "")}/${routeFile}`).replace(`.${method}`, "");

                    switch (method) {
                        case "get":
                            this.server.get(route, routeFunction);
                            break;
                        case "post":
                            this.server.post(route, routeFunction);
                            break;
                        case "delete":
                            this.server.delete(route, routeFunction);
                            break;
                        case "patch":
                            this.server.patch(route, routeFunction);
                            break;
                    }
                }
            }
        },

        read: async () => {
            await this.routes.parseDirectory(`${__dirname}/routes`)
        }
    };

    middleware: APIObject<IMiddlewareList> = {
        list: {},

        parseDirectory: async (path: string) => {
            const middlewareFiles = await readdir(path);

            for (let middlewareFile of middlewareFiles) {
                const dirStats = await lstat(`${path}/${middlewareFile}`);

                if (dirStats.isDirectory()) {
                    await this.routes.parseDirectory(`${path}/${middlewareFile}`);
                }
                else {

                    const middlewareFunction = ((await import(`.${path.replace(__dirname, "")}/${middlewareFile}`)).default).bind(null, this.guardsman);
                    this.server.use(middlewareFunction);
                }
            }
        },

        read: async () => {
            let dirExists = true;

            try {
                await lstat(`${__dirname}/middleware`);
            }
            catch (error) {
                dirExists = false;
            }

            if (!dirExists) return; //this.guardsman.log.warn("Guardsman API middleware folder does not exist. Skipping middleware parse step...");
            await this.middleware.parseDirectory(`${__dirname}/middleware`);
        }

    }
}