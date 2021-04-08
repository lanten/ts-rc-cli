import path from 'path'
import chalk from 'chalk'
import merge from 'webpack-merge'
import { exConsole, syncExec } from '../utils'
import { assignDefaultConfig } from './default.config'
import { ReactTsConfig } from '../../typings'

const { CONFIG_PATH = 'config' } = process.env

const rootPath = process.cwd()
const rootName = rootPath.replace(/^\/.*\//, '')
const inputPath = path.resolve(rootPath, CONFIG_PATH)
const outPath = path.resolve(__dirname, '../config-dist', `${rootName}.${CONFIG_PATH}`)

exConsole.info(chalk.cyanBright('Config Compiling...'))

syncExec({
  bash: `rm -rf ${outPath}`,
  msg: 'Config clear',
})

syncExec({
  bash: `tsc -p ${inputPath} --outDir ${outPath}`,
  msg: 'Config compile',
})

let userConfig = require(outPath)
if (userConfig.default) userConfig = userConfig.default

const config = merge<ReactTsConfig>(assignDefaultConfig(userConfig), userConfig)

export default config
