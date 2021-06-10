# Node-RED Admin CLI

The Node-RED admin command line interface.

[![Build Status](https://travis-ci.org/node-red/node-red-admin.svg?branch=master)](https://travis-ci.org/node-red/node-red-admin) [![Coverage Status](https://coveralls.io/repos/node-red/node-red-admin/badge.svg?branch=master)](https://coveralls.io/r/node-red/node-red-admin?branch=master)


A command line tool for remotely administering Node-RED.

It is built into `node-red` and can be run as:

    node-red admin ....


## Standalone install

Install this globally to make the `node-red-admin` command available on your path:

    npm install -g node-red-admin

Note: you may need to run this with `sudo`, or from within an Administrator command shell.

You may also need to add `--unsafe-perm` to the command if you hit permissions errors during install.

## Usage

    Usage:
       node-red-admin <command> [args] [--help] [--userDir DIR] [--json]

    Description:
       Node-RED command-line client

    Commands:
       target  - Set or view the target URL and port like http://localhost:1880
       login   - Log user in to the target of the Node-RED admin API
       list    - List all of the installed nodes
       info    - Display more information about the module or node
       enable  - Enable the specified module or node set
       disable - Disable the specified module or node set
       search  - Search for Node-RED modules to install
       install - Install the module from NPM to Node-RED
       remove  - Remove the NPM module from Node-RED
       hash-pw - Creates a hash to use for Node-RED settings like "adminAuth"

By default, the tool stores its configuration in `~/.node-red/.cli-config.json`. You
can specify a different directory for the config file using the `--userDir` argument.

The `--json` option causes the tool to format its output as JSON making it suitable
for scripting.
