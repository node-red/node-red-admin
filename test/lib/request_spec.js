/**
 * Copyright 2014 IBM Corp.
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

var should = require("should");
var sinon = require("sinon");
var fs = require("fs");
var request = require("request");

var api = require("../../lib/request");
var config = require("../../lib/config");

describe("lib/request", function() {
    "use strict";
    before(function() {
        sinon.stub(config,"target",function() { return "http://example.com/target"; });
        sinon.stub(config,"tokens",function() { return null; });
    });
    after(function() {
        config.target.restore();
        config.tokens.restore();
    });
    
    it('uses config.target for base path', function(done) {
        sinon.stub(request, 'get').yields(null, {statusCode:200}, JSON.stringify({a: "b"}));

        api.request("/foo",{}).then(function(res) {
            try {
                request.get.args[0][0].headers.should.not.have.a.property("Authorization");
                request.get.args[0][0].url.should.eql("http://example.com/target/foo");
                done();
            } catch(err) {
                done(err);
            } finally {
                request.get.restore();
            }
        }).otherwise(function(err) {
            request.get.restore();
            done(err);
        });
    });
    
    it('returns the json response to a get', function(done) {
        sinon.stub(request, 'get').yields(null, {statusCode:200}, JSON.stringify({a: "b"}));

        api.request("/foo",{}).then(function(res) {
            try {
                res.should.eql({a:"b"});
                done();
            } catch(err) {
                done(err);
            } finally {
                request.get.restore();
            }
        }).otherwise(function(err) {
            request.get.restore();
            done(err);
        });
    });

    it('returns the json response to a put', function(done) {
        sinon.stub(request, 'put').yields(null, {statusCode:200}, JSON.stringify({a: "b"}));

        api.request("/nodes/node",{method: "PUT"}).then(function(res) {
            try {
                res.should.eql({a:"b"});
                done();
            } catch(err) {
                done(err);
            } finally {
                request.put.restore();
            }
        }).otherwise(function(err) {
            request.put.restore();
            done(err);
        });
    });

    it('returns the json response to a post', function(done) {
        sinon.stub(request, 'post').yields(null, {statusCode:200}, JSON.stringify({a: "b"}));

        api.request("/nodes",{method: "POST"}).then(function(res) {
            try {
                res.should.eql({a:"b"});
                done();
            } catch(err) {
                done(err);
            } finally {
                request.post.restore();
            }
        }).otherwise(function(err) {
            request.post.restore();
            done(err);
        });
    });

    it('returns to a delete', function(done) {
        sinon.stub(request, 'del').yields(null, {statusCode:204});

        api.request("/nodes/plugin",{method: "DELETE"}).then(function() {
            request.del.restore();
            done();
        }).otherwise(function(err) {
            request.del.restore();
            done(err);
        });
    });
    
    
    it('rejects unauthorised', function(done) {
        sinon.stub(request, 'get').yields(null, {statusCode:401});

        api.request("/nodes/plugin",{}).then(function() {
            request.get.restore();
            done(new Error("Unauthorised response not rejected"));
        }).otherwise(function(err) {
            try {
                err.should.eql(401);
                done();
            } catch(err) {
                done(err);
            } finally {
                request.get.restore();
            }
        });
    });
    
    it('rejects error', function(done) {
        sinon.stub(request, 'get').yields(new Error("test error"), {statusCode:401});

        api.request("/nodes/plugin",{}).then(function() {
            request.get.restore();
            done(new Error("Unauthorised response not rejected"));
        }).otherwise(function(err) {
            try {
                err.should.eql("Error: test error");
                done();
            } catch(err) {
                done(err);
            } finally {
                request.get.restore();
            }
        });
    });
    
    
    it('returns unexpected status', function(done) {
        sinon.stub(request, 'get').yields(null, {statusCode:101},"response");

        api.request("/nodes/plugin",{}).then(function() {
            request.get.restore();
            done(new Error("Unexpected status not logged"));
        }).otherwise(function(err) {
            try {
                err.should.eql("101: response");
                done();
            } catch(err) {
                done(err);
            } finally {
                request.get.restore();
            }
        });
    });
    
    it('returns server message', function(done) {
        sinon.stub(request, 'get').yields(null, {statusCode:101},'{"message":"server response"}');

        api.request("/nodes/plugin",{}).then(function() {
            request.get.restore();
            done(new Error("Unexpected status not logged"));
        }).otherwise(function(err) {
            try {
                err.should.eql("101: server response");
                done();
            } catch(err) {
                done(err);
            } finally {
                request.get.restore();
            }
        });
    });
    
    it('attaches authorization header if token available', function(done) {
        sinon.stub(request, 'get').yields(null, {statusCode:200}, JSON.stringify({a: "b"}));
        config.tokens.restore();
        sinon.stub(config,"tokens",function() { return {access_token:"123456"}});
        
        api.request("/foo",{}).then(function(res) {
            try {
                res.should.eql({a:"b"});
                request.get.args[0][0].headers.should.have.a.property("Authorization","Bearer 123456");
                done();
            } catch(err) {
                done(err);
            } finally {
                request.get.restore();
            }
        }).otherwise(function(err) {
            request.get.restore();
            done(err);
        });

    });
    
    
    it('logs output if NR_TRACE is set', function(done) {
        sinon.stub(request, 'get').yields(null, {statusCode:200}, JSON.stringify({a: "b"}));
        sinon.stub(console, 'log');
        process.env.NR_TRACE = true;
        api.request("/foo",{}).then(function(res) {
            try{
                var wasCalled = console.log.called;
                console.log.restore();
                wasCalled.should.be.true;
                done();
            } catch(err) {
                console.log.restore();
                done(err);
            } finally {
                delete process.env.NR_TRACE;
                request.get.restore();
            }
        }).otherwise(function(err) {
            delete process.env.NR_TRACE;
            console.log.restore();
            request.get.restore();
            done(err);
        });
    });
});
