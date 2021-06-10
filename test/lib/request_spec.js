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

var should = require("should");
var sinon = require("sinon");
var fs = require("fs");
var request = require("axios");

var api = require("../../lib/request");
var config = require("../../lib/config");

describe("lib/request", function() {
    "use strict";
    before(function() {
        sinon.stub(config,"target").returns("http://example.com/target");
        sinon.stub(config,"tokens").returns(null);
    });
    after(function() {
        config.target.restore();
        config.tokens.restore();
    });

    it('uses config.target for base path', function(done) {
        sinon.stub(request, 'get').returns(Promise.resolve({status: 200}));

        api.request("/foo",{}).then(function(res) {
            try {
                request.get.args[0][0].should.eql("http://example.com/target/foo");
                request.get.args[0][1].headers.should.not.have.a.property("Authorization");
                done();
            } catch(err) {
                done(err);
            } finally {
                request.get.restore();
            }
        }).catch(function(err) {
            request.get.restore();
            done(err);
        });
    });

    it('returns the json response to a get', function(done) {
        sinon.stub(request, 'get').returns(Promise.resolve({status:200, data: {a:"b"}}))

        api.request("/foo",{}).then(function(res) {
            try {
                res.should.eql({a:"b"});
                done();
            } catch(err) {
                done(err);
            } finally {
                request.get.restore();
            }
        }).catch(function(err) {
            request.get.restore();
            done(err);
        });
    });

    it('returns the json response to a put', function(done) {
        sinon.stub(request, 'put').returns(Promise.resolve({status:200, data: {a:"b"}}))

        api.request("/nodes/node",{method: "PUT"}).then(function(res) {
            try {
                res.should.eql({a:"b"});
                done();
            } catch(err) {
                done(err);
            } finally {
                request.put.restore();
            }
        }).catch(function(err) {
            request.put.restore();
            done(err);
        });
    });

    it('returns the json response to a post', function(done) {
        sinon.stub(request, 'post').returns(Promise.resolve({status:200, data: {a:"b"}}))

        api.request("/nodes",{method: "POST"}).then(function(res) {
            try {
                res.should.eql({a:"b"});
                done();
            } catch(err) {
                done(err);
            } finally {
                request.post.restore();
            }
        }).catch(function(err) {
            request.post.restore();
            done(err);
        });
    });

    it('returns to a delete', function(done) {
        sinon.stub(request, 'delete').returns(Promise.resolve({status:200, data: {a:"b"}}))

        api.request("/nodes/plugin",{method: "DELETE"}).then(function() {
            request.delete.restore();
            done();
        }).catch(function(err) {
            request.delete.restore();
            done(err);
        });
    });


    it('rejects unauthorised', function(done) {
        var rejection = Promise.reject({status:401});
        rejection.catch(()=>{});
        sinon.stub(request, 'get').returns(rejection)

        api.request("/nodes/plugin",{}).then(function() {
            request.get.restore();
            done(new Error("Unauthorised response not rejected"));
        }).catch(function(err) {
            try {
                err.status.should.eql(401);
                done();
            } catch(err) {
                done(err);
            } finally {
                request.get.restore();
            }
        });
    });

    it('rejects error', function(done) {
        var rejection = Promise.reject({status:400,data:{message:"test error"}});
        rejection.catch(()=>{});
        sinon.stub(request, 'get').returns(rejection)

        api.request("/nodes/plugin",{}).then(function() {
            request.get.restore();
            done(new Error("Unauthorised response not rejected"));
        }).catch(function(err) {
            try {
                err.status.should.eql(400);
                err.data.message.should.eql("test error")
                done();
            } catch(err) {
                done(err);
            } finally {
                request.get.restore();
            }
        });
    });


    it('returns unexpected status', function(done) {
        sinon.stub(request, 'get').returns(Promise.resolve({status:101, data: "response"}))

        api.request("/nodes/plugin",{}).then(function() {
            request.get.restore();
            done(new Error("Unexpected status not logged"));
        }).catch(function(err) {
            try {
                err.message.should.eql("101: response");
                done();
            } catch(err) {
                done(err);
            } finally {
                request.get.restore();
            }
        });
    });

    it('returns server message', function(done) {
        sinon.stub(request, 'get').returns(Promise.resolve({status:101, data: {"message":"server response"}}))

        api.request("/nodes/plugin",{}).then(function() {
            request.get.restore();
            done(new Error("Unexpected status not logged"));
        }).catch(function(err) {
            try {
                err.message.should.eql("101: server response");
                done();
            } catch(err) {
                done(err);
            } finally {
                request.get.restore();
            }
        });
    });

    it('attaches authorization header if token available', function(done) {
        sinon.stub(request, 'get').returns(Promise.resolve({status: 200,data:{a:"b"}}));
        config.tokens.restore();
        sinon.stub(config,"tokens").returns({access_token:"123456"});

        api.request("/foo",{}).then(function(res) {
            try {
                res.should.eql({a:"b"});
                request.get.args[0][1].headers.should.have.a.property("Authorization","Bearer 123456");
                done();
            } catch(err) {
                done(err);
            } finally {
                request.get.restore();
            }
        }).catch(function(err) {
            request.get.restore();
            done(err);
        });

    });


    it('logs output if NR_TRACE is set', function(done) {
        sinon.stub(request, 'get').returns(Promise.resolve({status: 200,data:{a:"b"}}));
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
        }).catch(function(err) {
            delete process.env.NR_TRACE;
            console.log.restore();
            request.get.restore();
            done(err);
        });
    });
});
