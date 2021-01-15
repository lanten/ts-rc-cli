#! /usr/bin/env node

const path = require('path')
const crossEnv = require('cross-env')

const args = process.argv.slice(2)

args.push('CREATE_ENV=default', 'node', path.resolve(__dirname, '../dist/tasks/create.js'))

crossEnv(args)
