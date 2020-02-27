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
var defaultUrl = 'https://registry.npmjs.org/-/v1/search?text=keywords:node-red'
function command(argv,result) {
    var module = argv._[1];

    if (!module) {
        return result.help(command);
    }
    
    var options = {
        method: "GET",
        url: defaultUrl,
        headers: {
            'Accept': 'application/json',
        }
    };

    return when.promise(function(resolve) {
        options.url = defaultUrl + '+' + module
        httpRequest.get(options, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var objectsInfo = (JSON.parse(body));
                var filter = new RegExp(module);
                var found = false;
                result.log('total: ' + objectsInfo.total + ' objects: ' + objectsInfo.objects.length + ' found')
                var objectsEntry = {}
                for (var i = 0; i < objectsInfo.objects.length; i++) {
                    objectsEntry = objectsInfo.objects[i];
                    if(objectsEntry && objectsEntry.package) {
                        result.log(objectsEntry.package.name)

                        if (!filter
                            || filter.test(objectsEntry.package.name)
                            || filter.test(objectsEntry.package.description)
                            || filter.test(objectsEntry.package.keywords)) {

                            result.log((objectsEntry.package.name).cyan.bold + (" - " + objectsEntry.package.keywords).grey);
                            found = true;
                        }
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
