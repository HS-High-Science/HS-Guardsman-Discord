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

import { Request, Response } from "express";
import axios from "axios";
import { Guardsman } from "index";

export default async (guardsman: Guardsman, request: Request, response: Response) => {
  const query = request.query;
  const oauthCode = query.code || "";
  const codeState = query.state || "";

  if (oauthCode == "" || codeState == "") {
    return response.json({
      success: false,
      status: "OAuth2 Code or State not sent on request. Please try again."
    })
  }

  axios.post("https://apis.roblox.com/oauth/v1/token", {
    client_id: guardsman.environment.ROBLOX_CLIENT_ID,
    client_secret: guardsman.environment.ROBLOX_CLIENT_TOKEN,
    grant_type: "authorization_code",
    code: oauthCode.toString()
  }, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  })
    .then(res => {
      const accessToken = res.data.access_token;
      if (!accessToken) return response.json({ success: "false", status: "OAuth2 access token not sent on response. Please try again." });

      axios.get("https://apis.roblox.com/oauth/v1/userinfo", {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Bearer " + accessToken
        },

        data: {
          client_id: guardsman.environment.ROBLOX_CLIENT_ID,
          client_secret: guardsman.environment.ROBLOX_CLIENT_TOKEN
        }
      })
        .then(async res => {
          const userData = res.data;

          const userId = userData.sub;
          const username = userData.preferred_username;

          const pendingVerificationUser = await guardsman.database<IVerificationConfirmation>("pending_verification").where({
            token: codeState.toString()
          }).first();

          if (!pendingVerificationUser) return response.json({
            success: false,
            status: "Unable to verify request. Please try again."
          });

          const existingUser = await guardsman.database<IUser>("users")
            .select("*")
            .where("username", username)
            .orWhere("roblox_id", userId)
            .orWhere("discord_id", pendingVerificationUser.discord_id)
            .first();

          if (existingUser) {
            await guardsman.database<IUser>("users")
              .update({
                username: username,
                roblox_id: userId,
                discord_id: pendingVerificationUser.discord_id,
              })
              .where({
                id: existingUser.id
              })
          } else {
            await guardsman.database<IUser>("users")
              .insert({
                username: username,
                roblox_id: userId,
                discord_id: pendingVerificationUser.discord_id,
                roles: "[\"Player\"]"
              })
          }

          await guardsman.database<IVerificationConfirmation>("pending_verification")
            .delete("*")
            .where({
              discord_id: pendingVerificationUser.discord_id
            })

          response.redirect(guardsman.environment.VERIFICATION_COMPLETE_URI || "https://guardsman.bunkerbravointeractive.com/verification-complete")

          guardsman.bot.emit("verificationComplete", pendingVerificationUser.discord_id, username.toString());
        })
        .catch(_ => {
          return response.json({
            success: "false",
            status: "An error occurred when fetching OAuth2 resources. Please try again."
          })
        })
    })
    .catch(error => {
      console.log(error);

      return response.json({
        success: "false",
        status: "OAuth2 code is invalid. Please try again."
      })
    });
}
