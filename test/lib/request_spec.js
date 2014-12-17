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

describe("cli request", function() {
    "use strict";

    it('returns the json response to a get', sinon.test(function(done) {
        this.stub(request, 'get').yields(null, {statusCode:200}, JSON.stringify({a: "b"}));

        api.request("/foo",{}).then(function(res) {
            res.should.eql({a:"b"});
            done();
        }).otherwise(function(err) {
            done(err);
        });
    }));

    it('returns the json response to a put', sinon.test(function(done) {
        this.stub(request, 'put').yields(null, {statusCode:200}, JSON.stringify({a: "b"}));

        api.request("/nodes/node",{method: "PUT"}).then(function(res) {
            res.should.eql({a:"b"});
            done();
        }).otherwise(function(err) {
            done(err);
        });
    }));

    it('returns the json response to a post', sinon.test(function(done) {
        this.stub(request, 'post').yields(null, {statusCode:200}, JSON.stringify({a: "b"}));

        api.request("/nodes",{method: "POST"}).then(function(res) {
            res.should.eql({a:"b"});
            done();
        }).otherwise(function(err) {
            done(err);
        });
    }));

    it('returns to a delete', sinon.test(function(done) {
        this.stub(request, 'del').yields(null, {statusCode:204});

        api.request("/nodes/plugin",{method: "DELETE"}).then(function() {
            done();
        }).otherwise(function(err) {
            done(err);
        });
    }));
});
