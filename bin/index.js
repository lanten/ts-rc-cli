#! /usr/bin/env node

const path = require('path')
const crossEnv = require('cross-env')

const startType = process.argv[2]
const envs = process.argv.slice(3)

const NODE_ENV = {
  dev: 'development',
  build: 'production',
}[startType]

crossEnv([
  `START_TYPE=${startType}`,
  `NODE_ENV=${NODE_ENV}`,
  ...envs,
  'node',
  path.resolve(__dirname, '../dist/tasks/middleware.js'),
])
