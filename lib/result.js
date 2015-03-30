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
 
var Table = require('cli-table');
var util = require("util");
var colors = require("colors");
 
function logDetails(result) {
    if (result.nodes) {             // summary of node-module
        logModule(result);
    } else {                        // detailed node-set
        logNodeSet(result);
    }
}

function logModule(result) {
    var table = plainTable({plain:true});
    table.push(["Module:".bold,result.name]);
    table.push(["Version:".bold,result.version]);
    console.log(table.toString());
    console.log();
    logNodeList(result.nodes);
}

function logList(result) {
    if (result.nodes) {             // summary of node-module
        logNodeList(result.nodes);
    } else {                        // summary of node-set
        logNodeList(result);
    }
}

function logNodeSet(node) {
    if (util.isArray(node)) {
        if (node.length > 0) {
            node = node[0];
        }
    }
    var table = plainTable({plain:true});
    table.push(["Name:".bold, node.id.bold.cyan]);
    table.push(["Module:".bold,node.module]);
    table.push(["Version:".bold,node.version]);

    table.push(["Types:".bold, node.types.join(", ")]);
    table.push(["State:".bold, (node.err?node.err.red:(node.enabled?"enabled":"disabled"))]);

    console.log(table.toString());
}

function logNodeList(nodes) {
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
    nodeTable.push(["Nodes".bold,"Types".bold,"State".bold]);
    
    for(var i=0;i<nodes.length;i++) {
        var node = nodes[i];
        var state = node.enabled?(node.err?"error".red:"enabled"):"disabled".grey;
        var enabled = node.enabled&&!node.err;

        var types = "";
        for (var j=0;j<node.types.length;j++) {
            types += (j>0?"\n":"")+(enabled?node.types[j]:node.types[j].grey);
        }
        if (types.length === 0) {
            types = "none".grey;
        }
        
        nodeTable.push([enabled?node.id.bold.cyan:node.id.grey,
                        enabled?types:types.grey,
                        state]);
    }
    console.log(nodeTable.toString());
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
        if (msg == "401") {
            console.warn("Not logged in. Use '"+"node-red-admin login".yellow.bold+"' to log in.");
        } else {
            console.warn(msg.toString().magenta);
        }
    },
    help:function(command) {
        var helpText = "Usage:".bold + "\n" +
            "   node-red-admin " + command.usage + "\n\n" +
            "Description:".bold + "\n" +
            "   " + command.description + "\n\n" +
            "Options:".bold + "\n" +
            (command.options ? "   " + command.options + "\n" : "") +
            "   -h  --help      display this help text and exit";
        console.log(helpText);
    },
    logList:logList,
    logNodeList:logNodeList,
    logDetails:logDetails
};
