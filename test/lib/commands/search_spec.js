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

var command = require("../../../lib/commands/search");

var should = require("should");
var sinon = require("sinon");
var when = require("when");

var httpRequest = require("request");
var result = require("./result_helper");

describe("commands/install", function() {
    afterEach(function() {
        if (httpRequest.get.restore) {
            httpRequest.get.restore();
        }
        result.reset();
    });
    
    it('reports no results when none match',function(done) {
        sinon.stub(httpRequest,"get").yields(null,{statusCode:200},JSON.stringify({"objects":[],"total":0,"time":"Thu Feb 27 2020 11:27:22 GMT+0000 (UTC)"}));
        
        command({_:[null,"testnode"]},result).then(function() {
            result.log.called.should.be.true;
            result.log.args[0][0].should.eql("0 objects found");
            result.log.args[1][0].should.eql("No results found");
            done();
        }).otherwise(done);
            
    });
    it('lists matched modules',function(done) {
        sinon.stub(httpRequest,"get").yields(null,{statusCode:200},
            JSON.stringify({
                "objects":[
                    { "package":{"name": "testnode", "description": "a random node", "keywords":["testnode", "node-red", "test"]} },
                    { "package":{"name": "testnodes", "description": "a random nodes test", "keywords":["testnodes", "node-red", "tests"]} }
                ],
                "total":2,
                "time":"Thu Feb 27 2020 11:27:22 GMT+0000 (UTC)"
                })
        );
        
        command({_:[null,"testnode"]},result).then(function() {
            result.log.calledTwice.should.be.true;
            /testnode/.test(result.log.args[0][0]).should.be.true;
            /testnode/.test(result.log.args[1][0]).should.be.true;
            done();
        }).otherwise(done);
            
    });
    
    it('reports error response',function(done) {
        sinon.stub(httpRequest,"get").yields("testError",{statusCode:200},JSON.stringify({rows:[]}));
        
        command({_:[null,"testnode"]},result).then(function() {
            result.log.called.should.be.false;
            result.warn.called.should.be.true;
            result.warn.args[0][0].should.eql("testError");
            done();
        }).otherwise(done);
            
    });
    
    it('reports unexpected http response',function(done) {
        sinon.stub(httpRequest,"get").yields(null,{statusCode:101},"testError");
        
        command({_:[null,"testnode"]},result).then(function() {
            result.log.called.should.be.false;
            result.warn.called.should.be.true;
            result.warn.args[0][0].should.eql("101: testError");
            done();
        }).otherwise(done);
    });
    
    it('displays command help if node not specified', function(done) {
        command({_:{}},result);
        result.help.called.should.be.true;
        done();
    });
    
});
