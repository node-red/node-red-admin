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

var command = require("../../../lib/commands/hash");

var prompt = require("../../../lib/prompt");

var should = require("should");
var sinon = require("sinon");


var request = require("../../../lib/request");
try { bcrypt = require('bcrypt'); }
catch(e) { bcrypt = require('bcryptjs'); }

var result = require("./result_helper");

describe("commands/hash-pw", function() {
    afterEach(function() {
        result.reset();
        prompt.read.restore();
    });
    it('generates a bcrypt hash of provided password',function(done) {
        sinon.stub(prompt,"read").callsFake(function(opts,callback) {
            callback(null,"a-test-password");
        });

        command({},result).then(function() {
            result.log.calledOnce.should.be.true();
            var hash = result.log.firstCall.args[0];
            bcrypt.compare("a-test-password",hash,function(err,match) {
                match.should.be.true
                done();
            });
        });
    });
    it('ignores blank password',function(done) {
        sinon.stub(prompt,"read").callsFake(function(opts,callback) {
            callback(null,"");
        });

        command({},result).then(function() {
            result.log.called.should.be.false();
            done();
        });
    });
    it('ignores null password',function(done) {
        sinon.stub(prompt,"read").callsFake(function(opts,callback) {
            callback(null,null);
        });

        command({},result).then(function() {
            result.log.called.should.be.false();
            done();
        });
    });


});
