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

    var util = require("util");
    var request = require("request");
    var colors = require("colors");
    var api = require("./lib/request");
    var config = require("./lib/config");

    var Table = require('cli-table');
    var argv = require('minimist')(process.argv.slice(2));
    var format = "   [Enabled][Loaded]".green + " <module> <node-set> <types>";

    var commands = {
        "target": function() {
            setTarget();
        },
        "list": function() {
            list();
        },
        "view": function() {
            view();
        },
        "enable": function() {
            enable();
        },
        "disable": function() {
            disable();
        },
        "search": function() {
            searchNPM();
        },
        "install": function() {
            installModule();
        },
        "uninstall": function() {
            uninstallModule();
        }
    };

    function help() {
        var helpText = "Usage:".bold + "\n" +
            "   nr-cli <subcommand> [args] [options]\n\n" +
            "Description:".bold + "\n" +
            "   Node-RED command-line client, version TODO.\n\n" +
            "Type \'nr-cli <subcommand> --help\' to get help on a specific subcommand.\n" +
            "Type \'nr-cli --version\' to see just the version number.\n\n" +
            "Subcommands:\n".bold +
            "   target\n" +
            "   list\n" +
            "   view\n" +
            "   enable\n" +
            "   disable\n" +
            "   search\n" +
            "   install\n" +
            "   uninstall\n\n" +
            "Node-RED is a visual tool for wiring the Internet of Things.\n" +
            "For more information, visit http://node-red.org";
        console.log(helpText);
    }

    function createHelp(usage, description, options) {
        var helpText = "Usage:".bold + "\n" +
            "   nr-cli " + usage + "\n\n" +
            "Description:".bold + "\n" +
            "   " + description + "\n\n" +
            "Options:".bold + "\n" +
            (options ? "   " + options + "\n" : "") +
            "   -h  --help      display this help text and exit";
        console.log(helpText);
    }

    function setTarget() {
        var target = argv._[1];
        if (argv.h || argv.help) {
            var usage = "target [url] [options]";
            var desc = "Set or view the target URL";
            createHelp(usage, desc);
        } else if (target) {
            if (!/^https?:\/\/.+/.test(target)) {
                console.warn("Invalid target URL: " + target);
                return;
            }
            if (target.slice(-1) == "/") {
                target = target.slice(0, target.length - 1);
            }
            config.target = target;
            console.log("Target set to " + config.target.cyan.bold);
        } else {
            console.log("Target: " + config.target.cyan.bold);
        }
    }

    function list() {
        if (argv.h || argv.help) {
            var usage = "list [options]";
            var desc = "Lists all of the installed nodes with the format:\n" + format;
            createHelp(usage, desc);
        } else {
            api.request('/nodes', {}).then(logNodeList).otherwise(logFailure);
        }
    }

    function view() {
        var node = argv._[1];
        if (argv.h || argv.help || !node) {
            var usage = "view {module|node-set|id} [options]";
            var desc = "If viewing a module, lists all of the installed nodes in that module with the format:\n" + format +
                "\n\n   If viewing an individual node-set, shows the node details." +
                "\n\n   A node id joins its module and node-set with a forward slash, eg. node-red/debug";
            var opts = "-v  --version   display the module version";
            createHelp(usage, desc, opts);
        } else if (argv.v || argv.version) {
            api.request('/nodes/' + node.split("/")[0], {}).then(logVersion).otherwise(logFailure);
        } else {
            api.request('/nodes/' + node, {}).then(logDetails).otherwise(logFailure);
        }
    }

    function enable() {
        var node = argv._[1];
        if (argv.h || argv.help || !node) {
            var usage = "enable {module|id} [options]";
            var desc = "Enables the specified module or node set and displays the resulting status with the format:\n" +
                format +
                "\n\n   A node id joins its module and node-set with a forward slash, eg. node-red/debug";
            createHelp(usage, desc);
        } else {
            api.request('/nodes/' + node, {
                method: "PUT",
                body: JSON.stringify({
                    enabled: true
                })
            }).then(logList).otherwise(logFailure);
        }
    }

    function disable() {
        var node = argv._[1];
        if (argv.h || argv.help || !node) {
            var usage = "disable {module|id} [options]";
            var desc = "Disables the specified module or node set and displays the resulting status with the format:\n" +
                format +
                "\n\n   A node id joins its module and node-set with a forward slash, eg. node-red/debug";
            createHelp(usage, desc);
        } else {
            api.request('/nodes/' + node, {
                method: "PUT",
                body: JSON.stringify({
                    enabled: false
                })
            }).then(logList).otherwise(logFailure);
        }
    }

    function searchNPM() {
        var module = argv._[1];
        if (argv.h || argv.help || !module) {
            var usage = "search <search-term> [options]";
            var desc = "Searches NPM for Node-RED modules relating to the search-term given and displays the results with the format:\n" +
                "   <module-name>" + " - <module-description>".grey;
            createHelp(usage, desc);
        } else {
            var options = {
                method: "GET",
                url: 'https://registry.npmjs.org/-/_view/byKeyword?startkey=["node-red"]&amp;endkey=["node-red",{}]&amp;group_level=3',
                headers: {
                    'Accept': 'application/json',
                }
            };
            request(options, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    var info = (JSON.parse(body)).rows;
                    var filter = new RegExp(module);
                    var found = false;
                    for (var i = 0; i < info.length; i++) {
                        var n = info[i];
                        if (!filter || filter.test(n.key[1]) || filter.test(n.key[2])) {
                            console.log(n.key[1] + (" - " + n.key[2]).grey);
                            found = true;
                        }
                    }
                    if (!found) {
                        console.log("No results found");
                    }
                } else if (error) {
                    console.log(error.toString().red);
                } else {
                    console.log((response.statusCode + ": " + body).red);
                }
            });
        }
    }

    function installModule() {
        var module = argv._[1];
        if (argv.h || argv.help || !module) {
            var usage = "install <module> [options]";
            var desc = "Installs the module from NPM.";
            createHelp(usage, desc);
        } else {
            api.request('/nodes', {
                method: "POST",
                body: JSON.stringify({
                    module: module
                })
            }).then(logList).otherwise(logFailure);
        }
    }

    function uninstallModule() {
        var module = argv._[1];
        if (argv.h || argv.help || !module) {
            var usage = "uninstall <module> [options]";
            var desc = "Uninstalls the NPM module from Node-RED.";
            createHelp(usage, desc);
        } else {
            api.request('/nodes/' + module, {
                method: "DELETE"
            }).then(function() {
                console.log("Uninstalled " + module);
            }).otherwise(logFailure);
        }
    }

    function logDetails(result) {
        if (result.nodes) {             // summary of node-module
            logNodeList(result.nodes);
        } else {                        // detailed node-set
            logNodeDetails(result);
        }
    }

    function logList(result, details) {
        if (result.nodes) {             // summary of node-module
            logNodeList(result.nodes);
        } else {                        // summary of node-set
            logNodeList(result);
        }
    }

    function logNodeDetails(node) {
        if (util.isArray(node)) {
            if (node.length > 1) {
                multipleMatches(node);
                return;
            } else {
                node = node[0];
            }
        }
        var table = plainTable();

        table.push(["ID".bold, node.id]);
        table.push(["Node-Set".bold, node.name]);
        table.push(["Module".bold, node.module]);
        table.push(["Version".bold, node.version]);
        table.push(["Types".bold, node.types.join(", ")]);
        table.push(["Enabled".bold, node.enabled]);
        table.push(["Loaded".bold, node.loaded]);
        table.push(["Errors".bold, node.err ? node.err.red : "None"]);

        console.log(table.toString());
    }

    function logVersion(module) {
        if (module.version) {
            console.log(module.version);
        } else {
            logFailure("Version not found");
        }
    }

    function logNodeList(nodes) {
        if (nodes.multipleMatches) {
            multipleMatches(nodes.matches);
        } else {
            if (!util.isArray(nodes)) {
                nodes = [nodes];
            }

            var table = plainTable();
            nodes.forEach(function (n) {
                var types = n.types.join(", ");
                table.push([createStatus(n), n.module, n.name, types]);
            });

            console.log(table.toString());
        }

    }

    function logFailure(msg) {
        console.log(msg.red);
    }

    function multipleMatches(nodes) {
        console.log(nodes.length + " matching, did you mean?");
        nodes.forEach(function (n) {
            console.log("   " + n.id);
        });
    }

    function formatBoolean(v, c) {
        if (v) {
            return ("[" + c + "]");
        } else {
            return ("[ ]");
        }
    }

    function plainTable() {
        return new Table({
            chars: { 'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': '',
                'bottom': '' , 'bottom-mid': '' , 'bottom-left': '' ,
                'bottom-right': '', 'left': '' , 'left-mid': '' , 'mid': '' ,
                'mid-mid': '', 'right': '' , 'right-mid': '' , 'middle': '  ' },
            style: { 'padding-left': 0, 'padding-right': 0 }
        });
    }

    function createStatus(node) {
        var status = formatBoolean(node.enabled, "X") + formatBoolean(node.loaded, "L");

        if (node.enabled && node.loaded) {
            status = status.green;
        } else if (node.enabled && node.err) {
            status = status.red;
        } else {
            status = status.yellow;
        }

        return status;
    }

    if (commands[process.argv[2]]) {
        commands[process.argv[2]].call();
    }

    if (process.argv.length < 3 || process.argv.length < 4 && (argv.h || argv.help)) {
        help();
    }

    if (process.argv.length < 4 && (argv.v || argv.version)) {
        // version(); TODO
    }
