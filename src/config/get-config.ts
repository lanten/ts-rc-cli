import path from 'path'
import chalk from 'chalk'
import { exConsole, syncExec } from '../utils'
import { assignDefaultConfig } from './default.config'
import { ReactTsConfig } from '../../types/'

const configFolder = 'config'
const rootPath = process.cwd()
const inputPath = path.resolve(rootPath, configFolder)
const outPath = path.resolve(__dirname, configFolder)

exConsole.info(chalk.cyanBright('Config Compiling...'))

// syncExec({
//   bash: `tsc --outDir ${outPath} --rootDir ${rootPath} --esModuleInterop --resolveJsonModule --allowSyntheticDefaultImports --suppressImplicitAnyIndexErrors --module commonjs --target es6 ${inputPath}`,
//   msg: 'Config compile',
// })

// syncExec({
//   bash: `rm -rf ${outPath}`,
//   msg: 'Config clear',
// })

syncExec({
  bash: `tsc -p ${inputPath} --outDir ${outPath}`,
  msg: 'Config compile',
})

let userConfig = require(outPath)
if (userConfig.default) userConfig = userConfig.default

const config: ReactTsConfig = Object.assign({}, assignDefaultConfig(userConfig), userConfig)

export default config
