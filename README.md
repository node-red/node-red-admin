# Node-RED Command Line Tool

[![Build Status](https://travis-ci.org/node-red/node-red-admin.svg?branch=master)](https://travis-ci.org/node-red/node-red-admin) [![Coverage Status](https://coveralls.io/repos/node-red/node-red-admin/badge.svg?branch=master)](https://coveralls.io/r/node-red/node-red-admin?branch=master)


Install this globally to make the `node-red-admin` command available on
your path:

    npm install -g node-red-admin

Note: you may need to run this with `sudo`, or from within an Administrator command shell.


## Usage

    Usage:
       node-red-admin <command> [args] [--help]
    
    Description:
       Node-RED command-line client
    
    Commands:
       target - Set or view the target URL
       login - Log user in to the targetted Node-RED admin api
       list - List all of the installed nodes
       info - Display more information about the module or node
       enable - Enable the specified module or node set
       disable - Disable the specified module or node set
       search - Search NPM for Node-RED modules relating to the search-term given
       install - Install the module from NPM
       remove - Remove the NPM module

