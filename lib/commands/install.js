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

var request = require("../request");

function command(argv,result) {
    var module = argv._[1];
    var url = argv._[2];
    if (!module) {
        return result.help(command);
    }

    var data = {};
    var m = /^(.+)@(.+)$/.exec(module);
    if (m) {
        data.module = m[1];
        data.version = m[2];
    } else {
        data.module = module;
    }
    if (url) {
        data.url = url;
    }
    return request.request('/nodes', {
        method: "POST",
        data: data
    }).then(result.logDetails);
}
command.alias = "install";
command.usage = command.alias+" <module> [<url>]";
command.description = "Install a module.";


module.exports = command;
