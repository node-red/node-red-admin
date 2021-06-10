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

var command = require("../../../lib/commands/enable");

var should = require("should");
var sinon = require("sinon");

var request = require("../../../lib/request");
var result = require("./result_helper");

describe("commands/enable", function() {
    afterEach(function() {
        if (request.request.restore) {
            request.request.restore();
        }
        result.reset();
    });

    it('enables a node', function(done) {
        var error;
        sinon.stub(request,"request").callsFake(function(path,opts) {
            try {
                should(path).be.eql("/nodes/testnode");
                opts.should.eql({
                    method:"PUT",
                    data:{"enabled":true}
                });
            } catch(err) {
                error = err;
            }
            return Promise.resolve([]);
        });
        command({_:[null,"testnode"]},result).then(function() {
            if (error) {
                throw error;
            }
            result.logList.called.should.be.true();
            done();
        }).catch(done);
    });

    it('displays command help if node not specified', function(done) {
        command({_:{}},result);
        result.help.called.should.be.true();
        done();
    });
});