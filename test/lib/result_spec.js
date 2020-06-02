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

var result = require("../../lib/result");

/**
 * This is a very lazy set of tests. They simply invoke the api with no checking
 * of the results.
 * Individual commands already verify they return the correct data to this module.
 * The exact format of the command output is not finalised.
 */

describe("lib/result", function() {
    it("log",function() {
        result.log("msg");
    });
    it("warn",function() {
        result.warn("msg");
        result.warn("401");
    });
    it("help",function() {
        result.help({usage:"usage",description:"description",options:"options"});
    });
    it("logList",function() {
        result.logList([]);
        result.logList({nodes:[]});
    });
    it("logNodeList",function() {
        result.logNodeList([
            {id:"nodeId1",types:["a","b"],enabled:true},
            {id:"nodeId2",types:["c"],enabled:false},
            {id:"nodeId4",types:["d","e"],enabled:false,err:"error"},
            {id:"nodeId3",types:[],enabled:true,err:"error"},
            {id:"nodeId3",types:[],enabled:true,err:"error"}
        ]);
    });
    it("logDetails",function() {
        result.logDetails({id:"testId",module:"testModule",version:"testVersion",types:["a"],enabled:true});
        result.logDetails({id:"testId",module:"testModule",version:"testVersion",types:["a"],enabled:false});
        result.logDetails({id:"testId",module:"testModule",version:"testVersion",types:["a"],err:"error",enabled:true});
        result.logDetails({id:"testId",module:"testModule",version:"testVersion",types:["a"],err:"error",enabled:false});
        result.logDetails({name:"testModule",version:"testVersion",nodes:[{id:"nodeId",types:["a","b"],enabled:true}]});
    });
});