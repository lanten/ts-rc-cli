import path from 'path'
import chalk from 'chalk'
import merge from 'webpack-merge'
import { exConsole, syncExec, clearDir } from '../utils'
import { assignDefaultConfig } from './default.config'
import { ReactTsConfig } from '../../typings'

const { CONFIG_PATH = 'config' } = process.env

const rootPath = process.cwd()
const rootName = rootPath.replace(/^\/.*\//, '')
const inputPath = path.resolve(rootPath, CONFIG_PATH)
const outPath = path.resolve(__dirname, '../config-dist', `${rootName}-${CONFIG_PATH}`)

exConsole.info(chalk.cyanBright('Config Compiling...'))

clearDir(outPath, false, true)

const tscOptions = [
  '-m commonjs',
  '-t es6',
  '--moduleResolution node',
  '--resolveJsonModule true',
  '--esModuleInterop true',
  '--allowSyntheticDefaultImports true',
  '--suppressImplicitAnyIndexErrors true',
  '--skipLibCheck true',
  '--types node',
  '--lib esnext,scripthost,es5',
  `--outDir ${outPath}`,
]

syncExec({
  bash: `tsc ${inputPath} ${tscOptions.join(' ')}`,
  msg: 'Config compile',
})

let userConfig = require(outPath)
if (userConfig.default) userConfig = userConfig.default

const config = merge<ReactTsConfig>(assignDefaultConfig(userConfig), userConfig)

export default config
