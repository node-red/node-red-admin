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
sinon.test = require("sinon-test")(sinon);
var fs = require("fs");

var config = require("../../lib/config");

describe("lib/config", function() {
    "use strict";
    afterEach(function() {
        config.unload();
    });
    it('loads preferences when target referenced', sinon.test(function() {
        this.stub(fs,"readFileSync").callsFake(function() {
            return '{"target":"http://example.com:1880"}';
        });
        config.target().should.eql("http://example.com:1880");
    }));
    it('provide default value for target', sinon.test(function() {
        this.stub(fs,"readFileSync").callsFake(function() {
            return '{}';
        });
        config.target().should.eql("http://localhost:1880");
    }));

    it('saves preferences when target set', sinon.test(function() {
        this.stub(fs,"readFileSync").callsFake(function() {
            return '{"target":"http://another.example.com:1880"}';
        });
        this.stub(fs,"writeFileSync").callsFake(function() {});

        config.target().should.eql("http://another.example.com:1880");
        config.target("http://final.example.com:1880");
        config.target().should.eql("http://final.example.com:1880");

        fs.readFileSync.calledOnce.should.be.true;
        fs.writeFileSync.calledOnce.should.be.true;

    }));

    it('provide default value for tokens', sinon.test(function() {
        this.stub(fs,"readFileSync").callsFake(function() {
            return '{}';
        });
        should.not.exist(config.tokens());
    }));
    it('saves preferences when tokens set', sinon.test(function() {
        this.stub(fs,"readFileSync").callsFake(function() {
            return '{}';
        });
        this.stub(fs,"writeFileSync").callsFake(function() {});

        should.not.exist(config.tokens());
        config.tokens({access_token:"123"});
        config.tokens().should.eql({access_token:"123"});

        fs.readFileSync.calledOnce.should.be.true;
        fs.writeFileSync.calledOnce.should.be.true;
    }));

    it('setting preference to null removes it', sinon.test(function() {
        this.stub(fs,"readFileSync").callsFake(function() {
            return '{"tokens":{"access_token":"123"}}';
        });
        this.stub(fs,"writeFileSync").callsFake(function() {});

        config.tokens().should.eql({access_token:"123"});
        config.tokens(null);
        should.not.exist(config.tokens());

        fs.readFileSync.calledOnce.should.be.true;
        fs.writeFileSync.calledOnce.should.be.true;
    }));

});
