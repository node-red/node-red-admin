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

var config = require("./config");

var commands = {
    "target": require("./commands/target"),
    "list": require("./commands/list"),
    "init": require("./commands/init"),
    "info": require("./commands/info"),
    "enable": require("./commands/enable"),
    "disable": require("./commands/disable"),
    "search": require("./commands/search"),
    "install": require("./commands/install"),
    "remove": require("./commands/remove"),
    "login": require("./commands/login"),
    "hash-pw": require("./commands/hash"),
    // Leave 'projects' undocumented for now - needs more work to be useful
    "projects": require("./commands/projects")
};

function help() {
    var helpText = "Usage:" + "\n" +
        "   node-red-admin <command> [args] [--help] [--userDir DIR] [--json]\n\n" +
        "Description:" + "\n" +
        "   Node-RED command-line client\n\n" +
        "Commands:\n" +
        "   init    - Interactively generate a Node-RED settings file\n" +
        "   hash-pw - Creates a hash to use for Node-RED settings like \"adminAuth\"\n" +
        "   target  - Set or view the target URL and port like http://localhost:1880\n" +
        "   login   - Log user in to the target of the Node-RED admin API\n" +
        "   list    - List all of the installed nodes\n" +
        "   info    - Display more information about the module or node\n" +
        "   enable  - Enable the specified module or node set\n" +
        "   disable - Disable the specified module or node set\n" +
        "   search  - Search for Node-RED modules to install\n" +
        "   install - Install the module from NPM to Node-RED\n" +
        "   remove  - Remove the NPM module from Node-RED\n"
    ;
    console.log(helpText);
    return Promise.resolve();
}

module.exports = function(args) {
    var argv = require('minimist')(args);
    var command = argv._[0];
    if (commands[command]) {
        var result = require("./result");
        if (argv.json) {
            result.format("json");
        }
        if (argv.u || argv.userDir) {
            config.init(argv.u||argv.userDir);
        }
        if (argv.h || argv.help || argv['?']) {
            return result.help(commands[command]);
        } else {
            return commands[command](argv,result).catch(err => {
                result.warn(err);
                throw err;
            });
        }
    } else {
        return help();
    }
};
