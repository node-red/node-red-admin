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

var command = require("../../../lib/commands/target");

var should = require("should");
var sinon = require("sinon");

var config = require("../../../lib/config");

var result = require("./result_helper");

describe("commands/target", function() {
    var target;
    beforeEach(function() {
        target = "http://test.example.com";
        sinon.stub(config,"target").callsFake(function(arg) {
            if (arg) { target = arg } else { return target;}
        });
    });
    afterEach(function() {
        result.reset();
        config.target.restore();
    });

    it('queries the target', function(done) {
        command({_:[]},result).then(() => {;
            config.target.called.should.be.true();
            config.target.args[0].should.have.lengthOf(0);
            result.log.called.should.be.true();
            /http\:\/\/test\.example\.com/.test(result.log.args[0][0]).should.be.true();
            done();
        }).catch(done);
    });

    it('sets the target', function(done) {
        command({_:[null,"http://newtarget.example.com"]},result).then(() => {
            config.target.called.should.be.true();
            config.target.args[0][0].should.eql("http://newtarget.example.com");
            result.log.called.should.be.true();
            /http\:\/\/newtarget\.example\.com/.test(result.log.args[0][0]).should.be.true();
            done();
        }).catch(done);
    });

    it('rejects non http targets', function(done) {
        command({_:[null,"ftp://newtarget.example.com"]},result).then(() => {
            done("Should not have accepted non http target")
        }).catch(err => {
            config.target.called.should.be.false();
            done();
        }).catch(done);
    });
    it('strips trailing slash from target', function(done) {
        command({_:[null,"http://newtarget.example.com/"]},result).then(() => {
            config.target.called.should.be.true();
            config.target.args[0][0].should.eql("http://newtarget.example.com");
            done();
        }).catch(done);
    });




});