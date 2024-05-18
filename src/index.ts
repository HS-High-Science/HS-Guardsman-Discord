import knex, { Knex } from "knex";
import Bot from "./bot/index.js";
import logger from "./util/log.js";
// import trello from "./util/trello.js";
import { config } from "dotenv";
import Noblox from "noblox.js";
import API from "./api/index.js";
import * as process from "process";
import url from "url";
import axios, { AxiosInstance } from "axios";
import { User } from "discord.js";
import sentry from "@sentry/node";
import trello from "./util/trello.js";
const dirname = url.fileURLToPath(new URL('.', import.meta.url));

export enum GuardsmanState {
    OFFLINE,
    STARTING,
    ONLINE,
    STOPPING,
}

class GuardsmanObject {
    state: GuardsmanState = GuardsmanState.OFFLINE
    log;
    trello?: trello;
    mainBoard?: Board;
    debug = process.argv.includes("--debug")
    environment = config().parsed || {};
    database: Knex;
    roblox: typeof Noblox;
    ci: boolean = false;

    clientGUID: string = "";
    backend: AxiosInstance;

    api: API;
    bot: Bot;

    assets: string;

    constructor() {
        this.log = new logger("Guardsman", this);
        this.assets = `${dirname}/assets`;

        const argv = process.argv;
        if (argv.includes("--ci")) {
            this.log.warn("USING CI ENVIRONMENT.")
            this.ci = true;
            this.environment.DISCORD_TOKEN = "NO_LOGIN"
            this.environment.DISCORD_CLIENT_ID = "NO_LOGIN"
            this.environment.DB_CONNECTION = "mysql2";
            this.environment.DB_HOST = "127.0.0.1"
            this.environment.DB_PORT = "3306"
            this.environment.DB_DATABASE = "GDE_CI"
            this.environment.DB_USERNAME = "GDE_CI"
            this.environment.DB_PASSWORD = "GDE_CI"
        }

        this.log.info("Initializing Guardsman...");
        this.state = GuardsmanState.STARTING;

        if (this.environment.TRELLO_APP_KEY && this.environment.TRELLO_TOKEN && !this.ci)
        {
            this.trello = new trello(this.environment.TRELLO_APP_KEY, this.environment.TRELLO_TOKEN);
            this.trello.getBoard(this.environment.TRELLO_BOARD_ID).then(async board => {
                this.mainBoard = board;
            });
        }

        this.log.debug("Connecting to database...")
        this.database = knex({
            client: this.environment.DB_CONNECTION,
            connection: {
                host: this.environment.DB_HOST,
                port: parseInt(this.environment.DB_PORT, 10),
                database: this.environment.DB_DATABASE,
                user: this.environment.DB_USERNAME,
                password: this.environment.DB_PASSWORD,

                pool: {
                    min: 1,
                    max: 10,
                },
            },
        })

        this.log.debug("Connecting to ROBLOX API...")
        this.roblox = Noblox;
        if (!this.ci) {
            //    this.roblox.setCookie(this.environment.ROBLOX_COOKIE).then(_ => console.log);
        }

        this.log.debug("Hooking in to Sentry...")
        sentry.init({
            dsn: this.environment.SENTRY_DSN,
        })

        this.log.info("Creating backend Axios instance...")
        this.backend = axios.create({
            baseURL: this.environment.GUARDSMAN_API_URL,
            headers: {
                Authorization: this.environment.GUARDSMAN_API_TOKEN
            }
        });

        this.log.info("Initializing API...");
        this.api = new API(this);

        this.log.info("Initializing discord bot...")
        this.bot = new Bot(this);
    }

    sendStartupPing = async () => {
        if (!this.bot.user) return;

        const clientData = await this.backend.post(`discord/bot/startup`, {
            client_id: this.bot.user.id
        });

        this.clientGUID = clientData.data.client_guid;
    }

    sendClientPing = async () => {
        if (!this.bot.user) return;
        if (this.clientGUID === "") return this.sendStartupPing();

        const clientData = await this.backend.patch(`discord/bot/checkin`, {
            client_guid: this.clientGUID,
            client_id: this.bot.user.id
        });
    }

    userbase = {
        checkPermissionNode: async (user: User, node: GuardsmanPermissionNode): Promise<boolean> => {
            let userData: IAPIUser

            try {
                userData = (await this.backend.get(`discord/user/by-discord/${user.id}`)).data
            }
            catch (error) {
                return false;
            }

            return userData.permissions[node];
        },

        getPermissionLevel: async (user: User): Promise<number> => {
            let userData: IAPIUser

            try {
                userData = (await this.backend.get(`discord/user/by-discord/${user.id}`)).data
            }
            catch (error) {
                return 0;
            }

            return userData.position;
        },

        getId: async (user: User): Promise<number> => {
            let userData: IAPIUser

            try {
                userData = (await this.backend.get(`discord/user/by-discord/${user.id}`)).data
            }
            catch (error) {
                return 0;
            }

            return userData.id;
        }
    }

    configuration = {
        getGuildSettings: async (guildId: string): Promise<IGuildConfiguration | null> => {
            let guildSettings: IGuildConfiguration;

            try {
                guildSettings = (await this.backend.get(`discord/${guildId}/settings`)).data;
            }
            catch (error) {
                return null;
            }

            return guildSettings;
        },

        pushGuildSettings: async (guildId: string, settings: {}): Promise<boolean> => {
            let guildSettingsStatus;

            try {
                guildSettingsStatus = (await this.backend.put(`discord/${guildId}/settings`, settings)).data;
            }
            catch (error) {
                return false;
            }

            return guildSettingsStatus["success"];
        }
    }
}

const Guardsman = new GuardsmanObject();

export default Guardsman;
export type Guardsman = typeof Guardsman;
