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

const request = require("../../request");
const { prompt } = require("inquirer");
const fs = require("fs").promises;
const path = require("path");

let bcrypt;
try { bcrypt = require('bcrypt'); }
catch(e) { bcrypt = require('bcryptjs'); }

/**
 *  1. identify userdir
 *  2. check if settings file already exists
 *  3. get flowFile name
 *  3. get credentialSecret
 *  4. ask to setup adminAuth
 *    - prompt for username
 *    - prompt for password
 */

async function loadTemplateSettings() {
    const templateFile = path.join(__dirname,"resources/settings.js");
    return fs.readFile(templateFile,"utf8");
}


async function command(argv,result) {
    const responses = await prompt([
        {
            type: 'input',
            name: 'flowFile',
            message: 'What name for the flow file?',
            default: 'flows.json'
        },
        {
            type: 'password',
            name: 'credentialSecret',
            message: 'Provide a passphrase to encrypt your credentials file:'
        },
        {
            type: 'list',
            name: 'adminAuth',
            default: "Yes",
            message: 'Do you want to setup user security?',
            choices: ['Yes', 'No']
        },
        {
            type: 'input',
            name: 'username',
            message: 'Username?',
            when: function(opts) { return opts.adminAuth === 'Yes'}
        },
        {
            type: 'password',
            name: 'password',
            message: 'Password?',
            when: function(opts) { return opts.adminAuth === 'Yes'}
        },
    ]);


    const settingsTemplate = await loadTemplateSettings();

    // Ensure flowFile has `.json` extension
    let settings = settingsTemplate.replace('flowFile: "flows.json",',`flowFile: "${responses.flowFile}",`);

    if (responses.credentialSecret) {
        settings = settings.replace('//credentialSecret: "a-secret-key",',`credentialSecret: "${responses.credentialSecret}",`);
    }

    if (responses.adminAuth === 'Yes') {
        let password = bcrypt.hashSync(responses.password, 8)
        settings = settings.replace(/\/\/adminAuth: {[\S\s]*?\/\/},/g,`adminAuth: {
        type: "credentials",
        users: [{
            username: "${responses.username}",
            password: "${password}",
            permissions: "*"
        }]
    },`);

    }

    console.log(settings);

}
command.alias = "init";
command.usage = command.alias;
command.description = "Initialise a Node-RED settings file";

module.exports = command;
