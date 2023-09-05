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

const Enquirer = require('enquirer');
const color = require('ansi-colors');

const mustache = require("mustache");
const fs = require("fs");
const path = require("path");

let bcrypt;
try { bcrypt = require('bcrypt'); }
catch(e) { bcrypt = require('bcryptjs'); }

function prompt(opts) {
    const enq = new Enquirer();
    return enq.prompt(opts);
}

/**
 *  1. identify userdir
 *  2. check if settings file already exists
 *  3. Enable projects feature with version control?

 *  3. get flowFile name
 *  3. get credentialSecret
 *  4. ask to setup adminAuth
 *    - prompt for username
 *    - prompt for password
 */

async function loadTemplateSettings() {
    const templateFile = path.join(__dirname,"resources/settings.js.mustache");
    return fs.promises.readFile(templateFile,"utf8");
}

async function fillTemplate(template, context) {
    return mustache.render(template,context);
}

function heading(str) {
    console.log("\n"+color.cyan(str));
    console.log(color.cyan(Array(str.length).fill("=").join("")));
}
function message(str) {
    console.log(color.bold(str)+"\n");
}

async function promptSettingsFile(opts) {
    const defaultSettingsFile = path.join(opts.userDir,"settings.js");
    const responses = await prompt([
        {
            type: 'input',
            name: 'settingsFile',
            initial: defaultSettingsFile,
            message: "Settings file",
            onSubmit(key, value, p) {
                p.state.answers.exists = fs.existsSync(value);
            }
        },
        {
            type: 'select',
            name: 'confirmOverwrite',
            initial: "No",
            message: 'That file already exists. Are you sure you want to overwrite it?',
            choices: ['Yes', 'No'],
            result(value) {
                return value === "Yes"
            },
            skip() {
                return !this.state.answers.exists
            }
        }
    ]);

    if (responses.exists && !responses.confirmOverwrite) {
        return promptSettingsFile(opts);
    }
    // const alreadyExists = await fs.exists(responses.settingsFile);
    // responses.exists =
    return responses;
}

async function promptUser() {
    const responses = await prompt([
        {
            type: 'input',
            name: 'username',
            message: "Username",
            validate(val) { return !!val.trim() ? true: "Invalid username"}
        },
        {
            type: 'password',
            name: 'password',
            message: "Password",
            validate(val) {
                if (val.length < 8) {
                    return "Password too short. Must be at least 8 characters"
                }
                return true
            }
        },
        {
            type: 'select',
            name: 'permissions',
            message: "User permissions",
            choices: [ {name:"full access", value:"*"}, {name:"read-only access", value:"read"}],
            result(value) {
                return this.find(value).value;
            }
        }
    ])
    responses.password = bcrypt.hashSync(responses.password, 8);
    return responses;
}

async function promptSecurity() {
    heading("User Security");

    const responses = await prompt([
        {
            type: 'select',
            name: 'adminAuth',
            initial: "Yes",
            message: 'Do you want to setup user security?',
            choices: ['Yes', 'No'],
            result(value) {
                return value === "Yes"
            }
        }
    ])
    if (responses.adminAuth) {
        responses.users = [];
        while(true) {
            responses.users.push(await promptUser());
            const resp = await prompt({
                type: 'select',
                name: 'addMore',
                initial: "No",
                message: 'Add another user?',
                choices: ['Yes', 'No'],
                result(value) {
                    return value === "Yes"
                }
            })
            if (!resp.addMore) {
                break;
            }
        }
    }
    return responses;
}

async function promptProjects() {
    heading("Projects");
    message("The Projects feature allows you to version control your flow using a local git repository.");
    const responses = await prompt([
        {
            type: 'select',
            name: 'enabled',
            initial: "No",
            message: 'Do you want to enable the Projects feature?',
            choices: ['Yes', 'No'],
            result(value) {
                return value === "Yes";
            }
        },
        // {
        //     type: 'select',
        //     name: '_continue',
        //     message: 'Node-RED will help you create your project the first time you access the editor.',
        //     choices: ['Continue'],
        //     skip() {
        //         return !this.state.answers.enabled;
        //     }
        // },
        {
            type: 'select',
            name: 'workflow',
            message: 'What project workflow do you want to use?',
            choices: [
                {value: 'manual', name: 'manual - you must manually commit changes'},
                {value: 'auto', name: 'auto - changes are automatically committed'}
            ],
            skip() {
                return !this.state.answers.enabled;
            },
            result(value) {
                return this.find(value).value;
            }
        }
    ])
    // delete responses._continue;
    return responses
}

async function promptFlowFileSettings() {
    heading("Flow File settings");
    const responses = await prompt([
        {
            type: 'input',
            name: 'flowFile',
            message: 'Enter a name for your flows file',
            default: 'flows.json'
        },
        {
            type: 'password',
            name: 'credentialSecret',
            message: 'Provide a passphrase to encrypt your credentials file'
        }
    ])
    return responses
}

async function promptNodeSettings() {
    heading("Node settings");
    const responses = await prompt([
        {
            type: 'select',
            name: 'functionExternalModules',
            message: 'Allow Function nodes to load external modules? (functionExternalModules)',
            initial: 'Yes',
            choices: ['Yes', 'No'],
            result(value) {
                return value === "Yes"
            },
        }
    ]);
    return responses;
}
async function promptEditorSettings() {
    heading("Editor settings");
    const responses = await prompt([
        {
            type: 'select',
            name: 'theme',
            message: 'Select a theme for the editor. To use any theme other than "default", you will need to install @node-red-contrib-themes/theme-collection in your Node-RED user directory.',
            initial: 'default',
            choices: [ "default", "aurora", "cobalt2", "dark", "dracula", "espresso-libre", "midnight-red", "monoindustrial", "monokai", "oceanic-next", "oled", "solarized-dark", "solarized-light", "tokyo-night", "zenburn"],
        },
        {
            type: 'select',
            name: 'codeEditor',
            message: 'Select the text editor component to use in the Node-RED Editor',
            initial: 'monaco',
            choices: [ {name:"monaco (default)", value:"monaco"}, {name:"ace", value:"ace"} ],
            result(value) {
                return this.find(value).value;
            }
        }
    ]);
    return responses;
}
async function command(argv, result) {
    const config = {
        intro: `Node-RED Settings created at ${new Date().toUTCString()}`,
        flowFile: "flows.json",
        editorTheme: ""
    };

    heading("Node-RED Settings File initialisation");
    message(`This tool will help you create a Node-RED settings file.`);


    const userDir = argv["u"] || argv["userDir"] || path.join(process.env.HOME || process.env.USERPROFILE || process.env.HOMEPATH || process.env.NODE_RED_HOME,".node-red");

    const fileSettings = await promptSettingsFile({userDir});

    const securityResponses = await promptSecurity();
    if (securityResponses.adminAuth) {
        let adminAuth = {
            type: "credentials",
            users: securityResponses.users
        };
        config.adminAuth = JSON.stringify(adminAuth,"",4).replace(/\n/g,"\n    ");
    }

    const projectsResponses = await promptProjects();
    let flowFileSettings = {};
    if (!projectsResponses.enabled) {
        flowFileSettings = await promptFlowFileSettings();
        config.flowFile = flowFileSettings.flowFile;
        if (flowFileSettings.hasOwnProperty("credentialSecret")) {
            config.credentialSecret = flowFileSettings.credentialSecret?`"${flowFileSettings.credentialSecret}"`:"false"
        }
        config.projects = {
            enabled: false,
            workflow: "manual"
        }
    } else {
        config.projects = projectsResponses
    }
    const editorSettings = await promptEditorSettings();
    config.codeEditor = editorSettings.codeEditor;
    if (editorSettings.theme !== "default") {
        config.editorTheme = editorSettings.theme
    }
    const nodeSettings = await promptNodeSettings();
    config.functionExternalModules = nodeSettings.functionExternalModules;


    const template = await loadTemplateSettings();
    const settings = await fillTemplate(template, config)

    const settingsDir = path.dirname(fileSettings.settingsFile);
    await fs.promises.mkdir(settingsDir,{recursive: true});
    await fs.promises.writeFile(fileSettings.settingsFile, settings, "utf-8");


    console.log(color.yellow(`\n\nSettings file written to ${fileSettings.settingsFile}`));

    if (config.editorTheme) {
        console.log(color.yellow(`To use the '${config.editorTheme}' editor theme, remember to install @node-red-contrib-themes/theme-collection in your Node-RED user directory`))
    }
}
command.alias = "init";
command.usage = command.alias;
command.description = "Initialise a Node-RED settings file";

module.exports = command;
