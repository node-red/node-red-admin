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
const config = require("./config");

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
    table.push(["Module:",result.name]);
    table.push(["Version:",result.version]);
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
    table.push(["Name:", node.id]);
    table.push(["Module:",node.module]);
    table.push(["Version:",node.version]);

    table.push(["Types:", node.types.join(", ")]);
    table.push(["State:", (node.err?node.err:(node.enabled?"enabled":"disabled"))]);

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
    nodeTable.push(["Nodes","Types","State"]);

    for(var i=0;i<nodes.length;i++) {
        var node = nodes[i];
        var state = node.enabled?(node.err?"error":"enabled"):"disabled";
        var enabled = node.enabled&&!node.err;

        var types = "";
        if (node.types) {
            for (var j=0;j<node.types.length;j++) {
                types += (j>0?"\n":"")+(enabled?node.types[j]:node.types[j]);
            }
        }
        if (types.length === 0) {
            types = "none";
        }

        nodeTable.push([enabled?node.id:node.id,
                        enabled?types:types,
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
        if (process.env.NR_TRACE && msg.stack) {
            console.warn(msg.stack);
        }
        if (msg.response) {
            if (msg.response.status === 401) {
                if (outputFormat === "json") {
                    console.log(JSON.stringify({error:"Not logged in. Use 'login' to log in.", status: 401}," ",4));
                } else {
                    console.warn("Not logged in. Use 'login' to log in.");
                }
            } else if (msg.response.data) {
                if (msg.response.status === 404 && !msg.response.data.message) {
                    if (outputFormat === "json") {
                        console.log(JSON.stringify({error:"Node-RED Admin API not found. Use 'target' to set API location", status: 404}," ",4));
                    } else {
                        console.warn("Node-RED Admin API not found. Use 'target' to set API location");
                    }
                } else {
                    if (outputFormat === "json") {
                        console.log(JSON.stringify({error:msg.response.data.message, status: msg.response.status}," ",4));
                    } else {
                        console.warn(msg.response.status+": "+msg.response.data.message);
                    }
                }
            } else {
                if (outputFormat === "json") {
                    console.log(JSON.stringify({error:msg.toString(), status: msg.response.status}," ",4));
                } else {
                    console.warn(msg.response.status+": "+msg.toString());
                }
            }
        } else {
            var text = msg.toString();
            if (/ECONNREFUSED/.test(text)) {
                text = "Failed to connect to "+config.target();
            }
            if (outputFormat === "json") {
                console.log(JSON.stringify({error:text}));
            } else {
                console.warn(text);
            }
        }
    },
    help: function(command) {
        var helpText = "Usage:" + "\n" +
            "   node-red-admin " + command.usage + "\n\n" +
            "Description:" + "\n" +
            "   " + command.description + "\n\n" +
            "Options:" + "\n" +
            (command.options ? "   " + command.options + "\n" : "") +
            "   -h|?  --help      display this help text and exit";
        console.log(helpText);
        return Promise.resolve();
    },
    logList:logList,
    logNodeList:logNodeList,
    logDetails:logDetails,
    logProjectList:logProjectList,
    format: function(format) {
        outputFormat = format;
    }
};
