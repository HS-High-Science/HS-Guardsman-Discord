import { Guardsman } from "index";
import { updateUser } from "../util/user.js"
import { addInfoToString } from "../util/string.js";
import { GuildMember, TextChannel } from "discord.js";
import { getSettings } from "../util/guildSettings.js";
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";

export default async (guardsman: Guardsman, member: GuildMember) => {
    const guild = member.guild;
    const guildSettings = await getSettings(guardsman, guild);

    try {
        if (guildSettings.guildInfoMessageChannelID !== "") {
            const channel = guild.channels.cache.get(guildSettings.guildInfoMessageChannelID) as TextChannel;
            let attachment;

            if (channel) {
                if (guildSettings.joinMessageCard) {
                    const canvas = createCanvas(1600, 400);
                    const ctx = canvas.getContext("2d");

                    GlobalFonts.registerFromPath(`${guardsman.assets}/fonts/RobotoRegular.ttf`, "Roboto");

                    const grad = ctx.createLinearGradient(0, 0, canvas.height, (canvas.width / 2));
                    grad.addColorStop(0, "#D4145A");
                    grad.addColorStop(1, "#FBB03B");

                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    await loadImage(`${guardsman.assets}/images/Guardsman.png`).then((image) => {
                        const size = 150;
                        const pos = 100;

                        ctx.drawImage(image, ((canvas.width - pos) - (size / 2)), ((pos - 5) - (size / 2)), size, size);
                    });

                    await loadImage(guild.iconURL({ extension: "png", size: 1024 }) as string).then((image) => {
                        const size = 1024 * 1.2;
                        const pos = 600;
                        const radians = (Math.PI / 180) * 20;

                        const hAR = Math.abs(image.width * Math.sin(radians)) + Math.abs(image.height * Math.cos(radians));
                        const wAR = Math.abs(image.width * Math.cos(radians)) + Math.abs(image.height * Math.sin(radians));

                        const gCanvas = createCanvas(wAR, hAR);
                        const gCtx = gCanvas.getContext("2d");
                        gCtx.globalAlpha = 0.5;

                        gCtx.translate(wAR / 2, hAR / 2);
                        gCtx.rotate(radians);
                        gCtx.translate(-wAR / 2, -hAR / 2);

                        gCtx.beginPath();
                        gCtx.arc(gCanvas.width / 2, gCanvas.height / 2, 70, 0, Math.PI * 2, true);
                        gCtx.closePath();
                        gCtx.clip();

                        const aspect = image.height / image.width;
                        const hsx = 70 * Math.max(1.0 / aspect, 1.0);
                        const hsy = 70 * Math.max(aspect, 1.0);

                        gCtx.drawImage(image, (gCanvas.width / 2) - hsx, (gCanvas.height / 2) - hsy, hsx * 2, hsy * 2);

                        ctx.drawImage(gCanvas, ((canvas.width - pos) - (size / 2)), ((canvas.height / 2) - (size / 2)), size, size);
                    });

                    ctx.font = "60px Roboto";
                    ctx.fillStyle = "#000000";
                    ctx.fillText(`Welcome to ${guild.name},`, 20, 100);

                    ctx.font = "80px Roboto";
                    ctx.fillStyle = "#000000";
                    ctx.fillText(`${member.user.tag}!`, 20, 200);

                    ctx.font = "40px Roboto";
                    ctx.fillStyle = "#000000";
                    ctx.fillText("You are the newest member of our community!", 20, 300);

                    attachment = canvas.toBuffer("image/png");
                }

                channel.send({
                    content: addInfoToString(guildSettings.joinMessageContent, { server: guild.name, user: `<@${member.user.id}>` }),
                    files: attachment ? [{
                        attachment,
                        name: "Welcome.png"
                    }] : []
                });
            }
        }
    } catch (error) { }

    try {
        if (guildSettings.autoUpdateOnJoin) {
            const existingUserData = await guardsman.database<IUser>("users")
                .where("discord_id", member.id)
                .first();

            if (existingUserData) {
                await updateUser(guardsman, guild, member, existingUserData);
            }
        }
    } catch (error) { }
}