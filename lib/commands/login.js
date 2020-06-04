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

function command(argv,result) {
    config.tokens(null);
    return request.request('/auth/login',{}).then(function(resp) {
        return new Promise((resolve,reject) => {
            if (resp.type) {
                if (resp.type == "credentials") {
                    prompt.read({prompt:"Username:"},function(err, username) {
                        prompt.read({prompt:"Password:",silent: true},function(err, password) {
                            request.request('/auth/token', {
                                method: "POST",
                                data: {
                                    client_id: 'node-red-admin',
                                    grant_type: 'password',
                                    scope: '*',
                                    username: username,
                                    password: password
                                }
                            }).then(function(resp) {
                                config.tokens(resp);
                                result.log("Logged in");
                                resolve();
                            }).catch(function(resp) {
                                reject("Login failed");
                            });
                        });
                    });
                } else {
                    reject("Unsupported login type");
                }
            } else {
                resolve();
            }
        });
    });
}

command.alias = "login";
command.usage = command.alias+"";
command.description = "Log in to the targetted Node-RED admin api";

module.exports = command;
