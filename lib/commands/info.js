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
    var node = argv._[1];
    if (!node) {
        return result.help(command);
    }
    return request.request('/nodes/' + node, {}).then(result.logDetails);
}
command.alias = "info";
command.usage = command.alias+" {module|node}";
command.description = "Display more information about the module or node";

module.exports = command;
