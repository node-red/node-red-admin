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

var command = require("../../../lib/commands/login");

var prompt = require("../../../lib/prompt");

var should = require("should");
var sinon = require("sinon");
var when = require("when");


var request = require("../../../lib/request");
var config = require("../../../lib/config");
var result = require("./result_helper");

describe("commands/list", function() {
    beforeEach(function() {
        sinon.stub(config,"tokens",function(token) {});
        sinon.stub(prompt,"read",function(opts,callback) {
            if (/Username/.test(opts.prompt)) {
                callback(null,"username");
            } else if (/Password/.test(opts.prompt)) {
                callback(null,"password");
            }
        });
    });
    afterEach(function() {
        config.tokens.restore();
        prompt.read.restore();
        result.reset();
        if (request.request.restore) {
            request.request.restore();
        }
    });
    
    it('logs in user', function(done) {
        var requestStub = sinon.stub(request,"request");
        requestStub.onCall(0).returns(when.resolve({type:"credentials"}));
        requestStub.onCall(1).returns(when.resolve({access_token:"12345"}));
        
        
        command({},result).then(function() {
            requestStub.calledTwice.should.be.true;
            requestStub.args[0][0].should.eql("/auth/login");
            requestStub.args[1][0].should.eql("/auth/token");
            requestStub.args[1][1].should.eql({
                method:"POST",
                body:'{"client_id":"node-red-admin","grant_type":"password","scope":"*","username":"username","password":"password"}'
            });
            
            
            config.tokens.calledTwice.should.be.true;
            should(config.tokens.args[0][0]).not.exist;
            config.tokens.args[1][0].should.eql({access_token:"12345"});
            
            /Logged in/.test(result.log.args[0][0]).should.be.true;
            
            done();
        }).otherwise(done);
    });
    
    it('handles unsupported login type', function(done) {
        var requestStub = sinon.stub(request,"request");
        requestStub.onCall(0).returns(when.resolve({type:"unknown"}));
        requestStub.onCall(1).returns(when.resolve({access_token:"12345"}));
        command({},result).then(function() {
            requestStub.calledOnce.should.be.true;
            requestStub.args[0][0].should.eql("/auth/login");
            /Unsupported login type/.test(result.warn.args[0][0]).should.be.true;
            done();
        }).otherwise(done);
    });
    it('handles no authentication', function(done) {
        var requestStub = sinon.stub(request,"request");
        requestStub.onCall(0).returns(when.resolve({}));
        command({},result).then(function() {
            requestStub.calledOnce.should.be.true;
            requestStub.args[0][0].should.eql("/auth/login");
            result.log.called.should.be.false;
            result.warn.called.should.be.false;
            done();
        }).otherwise(done);
    });
    it('handles login failure', function(done) {
        var requestStub = sinon.stub(request,"request");
        requestStub.onCall(0).returns(when.resolve({type:"credentials"}));
        requestStub.onCall(1).returns(when.reject());
        command({},result).then(function() {
            config.tokens.calledOnce.should.be.true;
            should(config.tokens.args[0][0]).not.exist;
            
            result.log.called.should.be.false;
            result.warn.called.should.be.true;
            /Login failed/.test(result.warn.args[0][0]).should.be.true;
            done();
        }).otherwise(done);
    });
    
    it('handles unexpected error', function(done) {
        var requestStub = sinon.stub(request,"request");
        requestStub.onCall(0).returns(when.reject());
        command({},result).then(function() {
            config.tokens.calledOnce.should.be.true;
            should(config.tokens.args[0][0]).not.exist;
            result.log.called.should.be.false;
            result.warn.called.should.be.true;
            /Login failed/.test(result.warn.args[0][0]).should.be.true;
            done();
        }).otherwise(done);
    });
    
        
});