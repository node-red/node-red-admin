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

var Table = require('cli-table');
var util = require("util");
var colors = require("colors/safe");

var outputFormat = "text";

function logDetails(result) {
    if (result.nodes) {             // summary of node-module
        logModule(result);
    } else {                        // detailed node-set
        logNodeSet(result);
    }
}

function logModule(result) {
    if (outputFormat === "json") {
        console.log(JSON.stringify(result,' ',4));
        return;
    }
    var table = plainTable({plain:true});
    table.push([colors.bold("Module:"),result.name]);
    table.push([colors.bold("Version:"),result.version]);
    console.log(table.toString());
    console.log();
    logNodeList(result.nodes);
}

function logList(result) {
    if (outputFormat === "json") {
        console.log(JSON.stringify(result,' ',4));
        return;
    }
    if (result.nodes) {             // summary of node-module
        logNodeList(result.nodes);
    } else {                        // summary of node-set
        logNodeList(result);
    }
}

function logNodeSet(node) {
    if (outputFormat === "json") {
        console.log(JSON.stringify(node,' ',4));
        return;
    }
    if (util.isArray(node)) {
        if (node.length > 0) {
            node = node[0];
        }
    }
    var table = plainTable({plain:true});
    table.push([colors.bold("Name:"), colors.cyan(colors.bold(node.id))]);
    table.push([colors.bold("Module:"),node.module]);
    table.push([colors.bold("Version:"),node.version]);

    table.push([colors.bold("Types:"), node.types.join(", ")]);
    table.push([colors.bold("State:"), (node.err?colors.red(node.err):(node.enabled?"enabled":"disabled"))]);

    console.log(table.toString());
}

function logNodeList(nodes) {
    if (outputFormat === "json") {
        console.log(JSON.stringify(nodes,' ',4));
        return;
    }
    if (!util.isArray(nodes)) {
        nodes = [nodes];
    }
    nodes.sort(function(n1,n2) {
        var id1 = n1.id.toLowerCase();
        var id2 = n2.id.toLowerCase();
        if (id1<id2) {
            return -1;
        }
        if (id1>id2) {
            return 1;
        }
        return 0;
    });
    var nodeTable = plainTable();
    nodeTable.push([colors.bold("Nodes"),colors.bold("Types"),colors.bold("State")]);

    for(var i=0;i<nodes.length;i++) {
        var node = nodes[i];
        var state = node.enabled?(node.err?colors.red("error"):"enabled"):colors.grey("disabled");
        var enabled = node.enabled&&!node.err;

        var types = "";
        for (var j=0;j<node.types.length;j++) {
            types += (j>0?"\n":"")+(enabled?node.types[j]:colors.grey(node.types[j]));
        }
        if (types.length === 0) {
            types = colors.grey("none");
        }

        nodeTable.push([enabled?colors.cyan(colors.bold(node.id)):colors.grey(node.id),
                        enabled?types:colors.grey(types),
                        state]);
    }
    console.log(nodeTable.toString());
}

function logProjectList(projects) {
    if (outputFormat === "json") {
        console.log(JSON.stringify(projects,' ',4));
        return;
    }
    var projectList = projects.projects || [];
    if (projectList.length === 0) {
        console.log("No projects available");
        return;
    }
    projectList.sort();
    projectList.forEach(proj => {
        console.log((projects.active === proj ? "*":" ")+" "+proj);
    });
}


function plainTable(opts) {
    opts = opts||{};
    opts.chars = {
           'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': '',
           'bottom': '' , 'bottom-mid': '' , 'bottom-left': '' ,
           'bottom-right': '', 'left': '' , 'left-mid': '' , 'mid': '' ,
           'mid-mid': '', 'right': '' , 'right-mid': '' , 'middle': '   ' };
    opts.style = { 'padding-left': 0, 'padding-right': 0 };
    return new Table(opts);
}
module.exports = {
    log:function(msg) {
        console.log(msg);
    },
    warn:function(msg) {
        if (msg.response) {
            if (msg.response.status === 401) {
                console.warn("Not logged in. Use '"+colors.yellow(colors.bold("node-red-admin login"))+"' to log in.");
            } else if (msg.response.data) {
                console.warn(colors.magenta(msg.response.status+": "+msg.response.data.message));
            } else {
                console.warn(colors.magenta(msg.response.status+": "+msg.toString()));
            }
        } else {
            console.warn(colors.magenta(msg.toString()));
        }
    },
    help:function(command) {
        var helpText = colors.bold("Usage:") + "\n" +
            "   node-red-admin " + command.usage + "\n\n" +
            colors.bold("Description:") + "\n" +
            "   " + command.description + "\n\n" +
            colors.bold("Options:") + "\n" +
            (command.options ? "   " + command.options + "\n" : "") +
            "   -h|?  --help      display this help text and exit";
        console.log(helpText);
    },
    logList:logList,
    logNodeList:logNodeList,
    logDetails:logDetails,
    logProjectList:logProjectList,
    format: function(format) {
        outputFormat = format;
    }
};
