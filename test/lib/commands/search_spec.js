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

var command = require("../../../lib/commands/search");

var should = require("should");
var sinon = require("sinon");

var httpRequest = require("axios");
var result = require("./result_helper");

describe("commands/install", function() {
    afterEach(function() {
        if (httpRequest.get.restore) {
            httpRequest.get.restore();
        }
        result.reset();
    });

    it('reports no results when none match',function(done) {
        sinon.stub(httpRequest,"get").returns(Promise.resolve({status:200,data:{"data":[]}}));

        command({_:[null,"testnode"]},result).then(function() {
            result.log.called.should.be.true();
            result.log.args[0][0].should.eql("No results found");
            done();
        }).catch(done);

    });
    it('lists results ordered by relevance',function(done) {
        sinon.stub(httpRequest,"get").returns(Promise.resolve({status:200,data:{
            "data":[
                { "name":"another-node", "description":"a testnode - THREE" },
                { "name":"testnode", "description":"a test node - ONE" },
                { "name":"@scoped/testnode", "description":"once more - TWO" }
            ]
            }}));

        command({_:[null,"testnode"]},result).then(function() {
            result.log.args.length.should.equal(3);
            /ONE/.test(result.log.args[0][0]).should.be.true();
            /TWO/.test(result.log.args[1][0]).should.be.true();
            /THREE/.test(result.log.args[2][0]).should.be.true();
            done();
        }).catch(done);

    });

    it('reports unexpected http response',function(done) {
        sinon.stub(httpRequest,"get").returns(Promise.resolve({status:101,data:"testError"}));

        command({_:[null,"testnode"]},result).then(function() {
            done("Should not have resolved")
        }).catch(err => {
            result.log.called.should.be.false();
            /101: testError/.test(err).should.be.true();
            done();
        }).catch(done);
    });

    it('displays command help if node not specified', function(done) {
        command({_:{}},result);
        result.help.called.should.be.true();
        done();
    });

});
