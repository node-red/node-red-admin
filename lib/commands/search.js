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

var httpRequest = require("request");

var when = require("when");

function command(argv,result) {
    var module = argv._[1];
    if (!module) {
        return result.help(command);
    }
    
    var options = {
        method: "GET",
        url: 'https://registry.npmjs.org/-/_view/byKeyword?startkey=["node-red"]&amp;endkey=["node-red",{}]&amp;group_level=3',
        headers: {
            'Accept': 'application/json',
        }
    };
    return when.promise(function(resolve) {
        httpRequest.get(options, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var info = (JSON.parse(body)).rows;
                var filter = new RegExp(module);
                var found = false;
                for (var i = 0; i < info.length; i++) {
                    var n = info[i];
                    if (!filter || filter.test(n.key[1]) || filter.test(n.key[2])) {
                        result.log(n.key[1].cyan.bold + (" - " + n.key[2]).grey);
                        found = true;
                    }
                }
                if (!found) {
                    result.log("No results found");
                }
            } else if (error) {
                result.warn(error.toString());
            } else {
                result.warn((response.statusCode + ": " + body));
            }
            resolve();
        });
    });

}
command.name = "search";
command.usage = command.name+" <search-term>";
command.description = "Search NPM for Node-RED modules relating to the search-term given";


module.exports = command;
