# Node-RED Admin

The Node-RED admin command line interface.

[![Build Status](https://travis-ci.org/node-red/node-red-admin.svg?branch=master)](https://travis-ci.org/node-red/node-red-admin) [![Coverage Status](https://coveralls.io/repos/node-red/node-red-admin/badge.svg?branch=master)](https://coveralls.io/r/node-red/node-red-admin?branch=master)


A command line tool for Node-RED administrations.

Install this globally to make the `node-red-admin` command available on your path:

    npm install -g node-red-admin

Note: you may need to run this with `sudo`, or from within an Administrator command shell. 

You may also need to add `--unsafe-perm` to the command if you hit permissions errors during install.


## Usage

    Usage:
       node-red-admin <command> [args] [--help]
    
    Description:
       Node-RED command-line client
    
    Commands:
       target  - Set or view the target URL and port like http://localhost:1880
       login   - Log user in to the target of the Node-RED admin API
       list    - List all of the installed nodes
       info    - Display more information about the module or node
       enable  - Enable the specified module or node set
       disable - Disable the specified module or node set
       search  - Search NPM for Node-RED modules by matching name, description or keywords with the term
       install - Install the module from NPM
       remove  - Remove the NPM module
       hash-pw - creates a hash to use for Node-RED settings like "adminAuth"

