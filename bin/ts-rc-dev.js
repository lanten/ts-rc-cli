#! /usr/bin/env node

const path = require('path')
const crossEnv = require('cross-env')

const args = process.argv.slice(2)

args.push('NODE_ENV=development', 'node', path.resolve(__dirname, '../dist/tasks/dev-server.js'))

crossEnv(args)
