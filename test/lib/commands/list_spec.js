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

var command = require("../../../lib/commands/list");

var should = require("should");
var sinon = require("sinon");
var request = require("../../../lib/request");
var result = require("./result_helper");

describe("commands/list", function() {
    afterEach(function() {
        request.request.restore();
        result.reset();
    });

    it('lists all nodes', function(done) {
        var error;
        sinon.stub(request,"request").callsFake(function(path,opts) {
            try {
                should(path).be.eql("/nodes");
                opts.should.eql({});
            } catch(err) {
                error = err;
            }
            return Promise.resolve([]);
        });
        command({},result).then(function() {
            if (error) {
                throw error;
            }
            result.logNodeList.called.should.be.true();
            done();
        }).catch(done);
    });

});