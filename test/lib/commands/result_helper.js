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
var sinon = require("sinon");
var result = require("../../../lib/result");

module.exports = {
    log: sinon.spy(),
    warn: sinon.spy(),
    help: sinon.spy(),
    logList: sinon.spy(),
    logNodeList: sinon.spy(),
    logDetails: sinon.spy(),

    reset: function() {
        module.exports.log.resetHistory();
        module.exports.warn.resetHistory();
        module.exports.help.resetHistory();
        module.exports.logList.resetHistory();
        module.exports.logNodeList.resetHistory();
        module.exports.logDetails.resetHistory();
    }
};
