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

const request = require('axios');
const config = require("./config");

module.exports = {
    request: function(path, options) {
        var basePath = config.target();
        options = options || {};
        options.headers = options.headers || {};
        options.headers['accept'] = 'application/json';
        if (options.method === 'PUT' || options.method === 'POST') {
            options.headers['content-type'] = 'application/json';
        }
        const url = basePath + path;

        if (config.tokens()) {
            options.headers['Authorization'] = "Bearer "+config.tokens().access_token;
        }

        // Pull out the request function so we can stub it in the tests
        var requestFunc = request.get;

        if (options.method === 'PUT') {
            requestFunc = request.put;
        } else if (options.method === 'POST') {
            requestFunc = request.post;
        } else if (options.method === 'DELETE') {
            requestFunc = request.delete;
        }
        if (process.env.NR_TRACE) {
            console.log(options);
        }
        // GET takes two args - url/options
        // PUT/POST take three - utl/data/options
        return requestFunc(url,options.data || options, options).then(response => {
            if (process.env.NR_TRACE) {
                console.log(response.data);
            }
            if (response.status === 200) {        // OK
                return response.data;
            } else if (response.status === 204) { // No content
                return;
            } else {
                var message = response.status;
                if (response.data) {
                    message += ": "+(response.data.message||response.data);
                }
                var err = new Error(message);
                throw err;
            }
        }).catch(err => {
            if (process.env.NR_TRACE) {
                if (err.response) {
                    console.log("Response");
                    console.log("Status: "+err.response.status);
                    console.log(err.response.data);
                } else {
                    console.log("No response");
                }
            }
            throw err;
        });
    }
};
