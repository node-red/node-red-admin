#!/usr/bin/env node
/**
 * Copyright 2014 IBM Corp.
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

var request = require("request");
var colors = require("colors");
var api = require("./lib/request");
var config = require("./lib/config");
var result = require("./lib/result");

var argv = require('minimist')(process.argv.slice(2));

var commands = {
    "target": require("./lib/commands/target"),
    "list": require("./lib/commands/list"),
    "info": require("./lib/commands/info"),
    "enable": require("./lib/commands/enable"),
    "disable": require("./lib/commands/disable"),
    "search": require("./lib/commands/search"),
    "install": require("./lib/commands/install"),
    "remove": require("./lib/commands/remove"),
    "login": require("./lib/commands/login"),
    "hash-pw": require("./lib/commands/hash")
};



function help() {
    var helpText = "Usage:".bold + "\n" +
        "   node-red-admin <command> [args] [--help]\n\n" +
        "Description:".bold + "\n" +
        "   Node-RED command-line client\n\n" +
        "Commands:\n".bold +
        "   target\n" +
        "   login\n" +
        "   list\n" +
        "   info\n" +
        "   enable\n" +
        "   disable\n" +
        "   search\n" +
        "   install\n" +
        "   remove\n" +
        "   hash-pw\n"
    ;
    console.log(helpText);
}


var command = commands[process.argv[2]];

if (command) {
    if (argv.h || argv.help) {
        result.help(command);
    } else {
        commands[process.argv[2]](argv,result);
    }
} else {
    help();
}
