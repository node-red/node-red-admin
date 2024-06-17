/**
 * Copyright OpenJS Foundation and other contributors, https://openjsf.org/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

var request = require("../request");
var config = require("../config");
var prompt = require("../prompt");

async function command(argv,result) {
    config.tokens(null);
    const resp =  await request.request('/auth/login',{})
    if (resp.type) {
        if (resp.type == "credentials") {
            const username = await prompt.read({prompt:"Username:"})
            const password = await prompt.read({prompt:"Password:",silent: true})
            const loginResp = await request.request('/auth/token', {
                method: "POST",
                data: {
                    client_id: 'node-red-admin',
                    grant_type: 'password',
                    scope: '*',
                    username: username,
                    password: password
                }
            }).catch(resp => {
                throw new Error("Login failed");
            })
            config.tokens(loginResp);
            result.log("Logged in");
        } else {
            throw new Error("Unsupported login type");
        }
    }
}

command.alias = "login";
command.usage = command.alias+"";
command.description = "Log in to the targeted Node-RED admin api";

module.exports = command;
