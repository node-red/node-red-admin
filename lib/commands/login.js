/**
 * Copyright 2015 IBM Corp.
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

var when = require("when");

function command(argv,result) {
    return when.promise(function(resolve) {
        config.tokens(null);
        
        request.request('/auth/login',{}).then(function(resp) {
            if (resp.type) {
                if (resp.type == "credentials") {
                    prompt.read({prompt:"Username:".bold},function(err, username) {
                        prompt.read({prompt:"Password:".bold,silent: true},function(err, password) {
                            request.request('/auth/token', {
                                method: "POST",
                                body: JSON.stringify({
                                    client_id: 'node-red-admin',
                                    grant_type: 'password',
                                    scope: '*',
                                    username: username,
                                    password: password
                                })
                            }).then(function(resp) {
                                config.tokens(resp);
                                result.log("Logged in".green);
                                resolve();
                            }).otherwise(function(resp) {
                                result.warn("Login failed");
                                resolve();
                            });
                        });
                    });
                } else {
                    result.warn("Unsupported login type");
                    resolve();
                }
            } else {
                resolve();
            }
        }).otherwise(function(resp) {
            result.warn("Login failed");
            resolve();
        });
    });
}

command.name = "login";
command.usage = command.name+"";
command.description = "Log user in to the targetted Node-RED admin api";

module.exports = command;
