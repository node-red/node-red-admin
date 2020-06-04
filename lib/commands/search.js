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

var httpRequest = require("axios");

function command(argv,result) {
    var module = argv._[1];
    if (!module) {
        return result.help(command);
    }

    var options = {
        method: "GET",
        headers: {
            'Accept': 'application/json',
        }
    };
    return httpRequest.get('https://flows.nodered.org/things?format=json&per_page=50&type=node&term='+module, options).then(response => {
        if (response.status == 200) {
            var info = response.data;
            var matches = [];
            if (info.data && info.data.length > 0) {
                for (var i = 0; i < info.data.length; i++) {
                    var n = info.data[i];
                    var label = info.data[i].name + " - " + info.data[i].description;
                    var index = label.indexOf(module);
                    matches.push({
                        label: label,
                        index: index===-1?1000:index,
                        n:n
                    });
                }
                matches.sort(function(A,B) { return A.index - B.index; });
                if (argv.json) {
                    result.log(JSON.stringify(matches.map(function(m) { return {
                        name: m.n.name,
                        description: m.n.description,
                        version: (m.n['dist-tags']&& m.n['dist-tags'].latest)?m.n['dist-tags'].latest:undefined,
                        updated_at: m.n.updated_at
                    };})," ",4));
                } else {
                    matches.forEach(function(m) {
                        result.log(m.label);
                    });
                }

            } else {
                if (argv.json) {
                    result.log("[]");
                } else {
                    result.log("No results found");
                }
            }
        } else {
            throw new Error(response.status + ": " + response.data);
        }
    });

}
command.alias = "search";
command.usage = command.alias+" <search-term>";
command.description = "Search for Node-RED modules to install";


module.exports = command;
