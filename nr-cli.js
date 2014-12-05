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

    // "use strict";

    var util = require("util");
    var request = require("request");
    var colors = require("colors");
    var api = require("./lib/request");
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
            enable();
        },
        "disable": function() {
            disable();
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
        console.log(helpText);
    }

    function setTarget() {
        var target = argv._[1];
        if (argv.h || argv.help) {
            var usage = "target [options] [url]";
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

    function getNodes() {
        if (argv.h || argv.help) {
            var usage = "nodes [options]";
            var desc = "Shows a status list of installed nodes with the format:\n" +
                "   [Enabled][Loaded]".green + " [node-module] <node-names> " + "[warning-info]".red;
            var options = "-x  --hex   additionally display the hexadecimal id for each node";
            createHelp(usage, desc, options);
        } else if (argv.x || argv.hex) {
            api.request('/nodes', {}).then(logHexNodeList).otherwise(logFailure);
        } else {
            api.request('/nodes', {}).then(logSimpleNodeList).otherwise(logFailure);
        }
    }

    function getNode() {
        var node = argv._[1];
        if (argv.h || argv.help || !node) {
            var usage = "node [options] <node-name>";
            var desc = "Shows the status of the specified node with the format:\n" +
                "   [Enabled][Loaded]".green + " [node-module] <node-name> " + "[warning-info]".red;
            var options = "-x  --hex   additionally display the hexadecimal id for each node";
            createHelp(usage, desc, options);
        } else if (argv.x || argv.hex) {
            api.request('/nodes/' + node, {}).then(logHexNodeList).otherwise(logFailure);
        } else {
            api.request('/nodes/' + node, {}).then(logSimpleNodeList).otherwise(logFailure);
        }
    }

    function getPlugins() {
        if (argv.h || argv.help) {
            var usage = "plugins [options]";
            var desc = "Shows a list of installed NPM plugin packages";
            var options = "-x  --hex   additionally display the hexadecimal id for each node\n";
            createHelp(usage, desc, options);
        } else if (argv.x || argv.hex) {
            api.request('/plugins', {}).then(logHexPluginList).otherwise(logFailure);
        } else {
            api.request('/plugins', {}).then(logSimplePluginList).otherwise(logFailure);
        }
    }

    function getPlugin() {
        var plugin = argv._[1];
        if (argv.h || argv.help || !plugin) {
            var usage = "plugin [options] <plugin-name>";
            var desc = "Shows the status of an installed NPM plugin package";
            var options = "-x  --hex   additionally display the hexadecimal id for each node";
            createHelp(usage, desc, options);
        } else if (argv.x || argv.hex) {
            api.request('/plugins/' + plugin, {}).then(logHexPluginList).otherwise(logFailure);
        } else {
            api.request('/plugins/' + plugin, {}).then(logSimplePluginList).otherwise(logFailure);
        }
    }

    function enable() {
        var opt = argv._[1];
        if (argv.h || argv.help || !opt) {
            var usage = "enable [options] {node-type|node-set|plugin}";
            var desc = "Enables the specified node set or plugin and displays the result with the format:\n" +
                "   [Enabled][Loaded]".green + " [plugin:set] <node-name> " + "[warning-info]".red;
            createHelp(usage, desc);
        } else {
            if (opt.indexOf(":") > -1) { // plugin:set
                var split = opt.split(":");
                var plugin = split[0];
                var set = split[1];
                api.request('/plugins', {}).then(function(plugins) {
                    for (var i = 0; i < plugins.length; ++i) {
                        if (plugin === plugins[i].name) {
                            var nodes = plugins[i].nodes;
                            for (var j = 0; j < nodes.length; ++j) {
                                if (opt === nodes[j].name) {
                                    // TODO: Plugins with no node types
                                    enableNode(nodes[j].types[0]);
                                }
                            }
                        }
                    }
                }).otherwise(logFailure);
            } else {
                api.request('/plugins/' + opt, {}).then(function(plugin) { // plugin
                    for (var i = 0; i < plugin.nodes.length; ++i) {
                        var node = plugin.nodes[i];
                        // TODO: Plugins with no node types
                        enableNode(node.types[0]);
                    }
                }).otherwise(function() { // type
                    enableNode(opt);
                });
            }
        }
    }

    function enableNode(node) {
        api.request('/nodes/' + node, {
            method: "PUT",
            body: JSON.stringify({
                enabled: true
            })
        }).then(logSimpleNodeList).otherwise(logFailure);
    }

    function disable() {
        var opt = argv._[1];
        if (argv.h || argv.help || !opt) {
            var usage = "disable [options] {node-type|node-set|plugin}";
            var desc = "Disables the specified node set or plugin and displays the result with the format:\n" +
                "   [Enabled][Loaded]".green + " [plugin:set] <node-name> " + "[warning-info]".red;
            createHelp(usage, desc);
        } else {
            if (opt.indexOf(":") > -1) { // plugin:set
                var split = opt.split(":");
                var plugin = split[0];
                var set = split[1];
                api.request('/plugins', {}).then(function(plugins) {
                    for (var i = 0; i < plugins.length; ++i) {
                        if (plugin === plugins[i].name) {
                            var nodes = plugins[i].nodes;
                            for (var j = 0; j < nodes.length; ++j) {
                                if (opt === nodes[j].name) {
                                    // TODO: Plugins with no node types
                                    disableNode(nodes[j].types[0]);
                                }
                            }
                        }
                    }
                }).otherwise(logFailure);
            } else {
                api.request('/plugins/' + opt, {}).then(function(plugin) { // plugin
                    for (var i = 0; i < plugin.nodes.length; ++i) {
                        var node = plugin.nodes[i];
                        // TODO: Plugins with no node types
                        disableNode(node.types[0]);
                    }
                }).otherwise(function() { // type
                    disableNode(opt);
                });
            }
        }
    }

    function disableNode(node) {
        api.request('/nodes/' + node, {
            method: "PUT",
            body: JSON.stringify({
                enabled: false
            })
        }).then(logSimpleNodeList).otherwise(logFailure);
    }

    function searchNPM() {
        var plugin = argv._[1];
        if (argv.h || argv.help || !plugin) {
            var usage = "search [options] <search-term>";
            var desc = "Searches NPM for Node-RED plugins relating to the search-term given and displays the results with the format:\n" +
                "   <plugin-name>" + " - <plugin-description>".grey;
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
            var desc = "Installs the NPM node packaged plugin.";
            createHelp(usage, desc);
        } else {
            api.request('/nodes', {
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
            var desc = "Uninstalls the NPM node packaged plugin.";
            createHelp(usage, desc);
        } else {
            api.request('/nodes/' + plugin, {
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
            str += " [" + n.name + "]";
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

    if (process.argv.length < 3 || process.argv.length < 4 && (argv.h || argv.help)) {
        help();
    }
