#!/usr/bin/env node
// ;(function() {
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

    // "use strict";

    var util = require("util");
    var request = require("request");
    var colors = require("colors");
    var apiRequest = require("./lib/request");
    var config = require("./lib/config");

    var argv = require('minimist')(process.argv.slice(2));

    var commands = {
        "target": function() {
            setTarget();
        },
        "nodes": function() {
            getNodes();
        },
        "node": function() {
            getNode();
        },
        "plugins": function() {
            getPlugins();
        },
        "plugin": function() {
            getPlugin();
        },
        "enable": function() {
            enableNode();
        },
        "disable": function() {
            disableNode();
        },
        "search": function() {
            searchNPM();
        },
        "install": function() {
            installPlugin();
        },
        "uninstall": function() {
            uninstallPlugin();
        }
    };

    function help() {
        var helpText = "Usage:".bold + "\n" +
            "   nr-cli <subcommand> [options] [args]\n\n" +
            "Description:".bold + "\n" +
            "   Node-RED command-line client, version 1.0.\n\n" +
            "Type \'nr-cli <subcommand> --help\' to get help on a specific subcommand.\n" +
            "Type \'nr-cli --version\' to see just the version number.\n" +
            "Type \'nr-cli --about\' to see about information.\n\n" +
            "Subcommands:\n".bold +
            "   target\n" +
            "   nodes\n" +
            "   node\n" +
            "   enable\n" +
            "   disable\n" +
            "   plugins\n" +
            "   plugin\n" +
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
            "   -h  --help  display this help text and exit";
        return helpText;
    }

    function setTarget() {
        var target = argv._[1];
        if (argv.h || argv.help) {
            var usage = "target [options] [url]";
            var desc = "Set or view the target URL";
            console.log(createHelp(usage, desc));
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

    function getNodes() {
        if (argv.h || argv.help) {
            var usage = "nodes [options]";
            var desc = "Shows a status list of installed nodes with the format:\n" +
                "   [Enabled][Loaded]".green + " [node-module] <node-names> " + "[warning-info]".red;
            var options = "-x  --hex   additionally display the hexadecimal id for each node";
            console.log(createHelp(usage, desc, options));
        } else if (argv.x || argv.hex) {
            apiRequest('/nodes', {}).then(logHexNodeList).otherwise(logFailure);
        } else {
            apiRequest('/nodes', {}).then(logSimpleNodeList).otherwise(logFailure);
        }
    }

    function getNode() {
        var node = argv._[1];
        if (argv.h || argv.help || !node) {
            var usage = "node [options] <node-name>";
            var desc = "Shows the status of the specified node with the format:\n" +
                "   [Enabled][Loaded]".green + " [node-module] <node-name> " + "[warning-info]".red;
            var options = "-x  --hex   additionally display the hexadecimal id for each node";
            console.log(createHelp(usage, desc, options));
        } else if (argv.x || argv.hex) {
            apiRequest('/nodes/' + node, {}).then(logHexNodeList).otherwise(logFailure);
        } else {
            apiRequest('/nodes/' + node, {}).then(logSimpleNodeList).otherwise(logFailure);
        }
    }

    function getPlugins() {
        if (argv.h || argv.help) {
            var usage = "plugins [options]";
            var desc = "Shows a list of installed NPM plug-in packages";
            var options = "-x  --hex   additionally display the hexadecimal id for each node\n";
            console.log(createHelp(usage, desc, options));
        } else if (argv.x || argv.hex) {
            apiRequest('/plugins', {}).then(logHexPluginList).otherwise(logFailure);
        } else {
            apiRequest('/plugins', {}).then(logSimplePluginList).otherwise(logFailure);
        }
    }

    function getPlugin() {
        var plugin = argv._[1];
        if (argv.h || argv.help || !plugin) {
            var usage = "plugin [options] <plugin-name>";
            var desc = "Shows the status of an installed NPM plug-in package";
            var options = "-x  --hex   additionally display the hexadecimal id for each node";
            console.log(createHelp(usage, desc, options));
        } else if (argv.x || argv.hex) {
            apiRequest('/plugins/' + plugin, {}).then(logHexPluginList).otherwise(logFailure);
        } else {
            apiRequest('/plugins/' + plugin, {}).then(logSimplePluginList).otherwise(logFailure);
        }
    }

    function enableNode() {
        var node = argv._[1];
        if (argv.h || argv.help || !node) {
            var usage = "enable [options] {node-name|node-hex}";
            var desc = "Enables the specified node and displays the result with the format:\n" +
                "   [Enabled][Loaded]".green + " [plug-in] <node-name> " + "[warning-info]".red;
            console.log(createHelp(usage, desc));
        } else {
            apiRequest('/nodes/' + node, {
                method: "PUT",
                body: JSON.stringify({
                    enabled: true
                })
            }).then(logSimpleNodeList).otherwise(logFailure);
        }
    }

    function disableNode() {
        var node = argv._[1];
        if (argv.h || argv.help || !node) {
            var usage = "disable [options] {node-name|node-hex}";
            var desc = "Disables the specified node and displays the result with the format:\n" +
                "   [Enabled][Loaded]".green + " [plug-in] <node-name> " + "[warning-info]".red;
            console.log(createHelp(usage, desc));
        } else {
            apiRequest('/nodes/' + node, {
                method: "PUT",
                body: JSON.stringify({
                    enabled: false
                })
            }).then(logSimpleNodeList).otherwise(logFailure);
        }
    }

    function searchNPM() {
        var plugin = argv._[1];
        if (argv.h || argv.help || !plugin) {
            var usage = "search [options] <search-term>";
            var desc = "Searches NPM for Node-RED plugins relating to the search-term given and displays the results with the format:\n" +
                "   <plugin-name>" + " - <plugin-description>".grey;
            console.log(createHelp(usage, desc));
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
                    var filter = new RegExp(plugin);
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

    function installPlugin() {
        var plugin = argv._[1];
        if (argv.h || argv.help || !plugin) {
            var usage = "install [options] <node-plugin>";
            var desc = "Installs the NPM node packaged plug-in.";
            console.log(createHelp(usage, desc));
        } else {
            apiRequest('/nodes', {
                method: "POST",
                body: JSON.stringify({
                    module: plugin
                })
            }).then(logSimpleNodeList).otherwise(logFailure);
        }
    }

    function uninstallPlugin() {
        var plugin = argv._[1];
        if (argv.h || argv.help || !plugin) {
            var usage = "uninstall [options] <node-plugin>";
            var desc = "Uninstalls the NPM node packaged plug-in.";
            console.log(createHelp(usage, desc));
        } else {
            apiRequest('/nodes/' + plugin, {
                method: "DELETE"
            }).then(function() {
                console.log("Uninstalled " + plugin);
            }).otherwise(logFailure);
        }
    }

    function logSimpleNodeList(nodes) {
        logNodeList(nodes, false);
    }

    function logHexNodeList(nodes) {
        logNodeList(nodes, true);
    }

    function logNodeList(nodes, hex) {
        if (!util.isArray(nodes)) {
            nodes = [nodes];
        }
        for (var i = 0; i < nodes.length; i++) {
            var n = nodes[i];
            console.log(formatNodeInfo(n, hex, true));
        }
    }

    function logSimplePluginList(plugins) {
        logPluginList(plugins, false);
    }

    function logHexPluginList(plugins) {
        logPluginList(plugins, true);
    }

    function logPluginList(plugins, hex) {
        if (!util.isArray(plugins)) {
            plugins = [plugins];
        }
        for (var i = 0; i < plugins.length; ++i) {
            var m = plugins[i];
            console.log(m.name);
            for (var j = 0; j < m.nodes.length; ++j) {
                var n = m.nodes[j];
                console.log("   " + formatNodeInfo(n, hex, false));
            }
            if (i < plugins.length - 1) {
                console.log("");
            }
        }
    }

    function logFailure(msg) {
        console.log(msg.red);
    }

    function formatBoolean(v, c) {
        if (v) {
            return ("[" + c + "]");
        } else {
            return ("[ ]");
        }
    }

    function formatNodeInfo(n, hex, mod) {
        var inError = n.hasOwnProperty("err");

        var str = formatBoolean(n.enabled, "X") + formatBoolean(n.loaded, "L");
        if (hex) {
            str += " " + n.id;
        }
        if (n.enabled && n.loaded) {
            str = str.green;
        } else if (n.enabled && n.err) {
            str = str.red;
        } else {
            str = str.yellow;
        }
        if (n.module && mod) {
            str += " [" + n.module + "]";
        }
        str += " " + n.types.join(", ");
        if (n.err) {
            str += " " + n.err.red;
        }
        return str;
    }

    if (commands[process.argv[2]]) {
        commands[process.argv[2]].call();
    }

    if (process.argv.length < 3) {
        help();
    }

// })();
