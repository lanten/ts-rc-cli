import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import merge from 'webpack-merge'
import { exConsole, syncExec, clearDir } from '../utils'
import { assignDefaultConfig } from './default.config'
import { ReactTsConfig } from '../../typings'

const { CONFIG_PATH = 'config' } = process.env

const rootPath = process.cwd()
const rootName = rootPath.replace(/^\/.*\//, '')
const inputPath = path.resolve(rootPath, CONFIG_PATH, 'index.ts')

export const reactTsConfig = getConfig(inputPath)

export function getConfig(inputPath: string): ReactTsConfig {
  let fileName, ext
  inputPath.replace(/\/([^\/]+)$/, (_, $1: string) => {
    const $1Arr = $1.split('.')
    fileName = $1Arr[0]
    ext = $1Arr.length > 1 ? $1Arr[$1Arr.length - 1] : void 0
    return ''
  })
  fileName = ext === 'ts' ? `${fileName}.js` : 'index.js'

  if (!fs.existsSync(inputPath)) {
    exConsole.error(`The configuration file: ${inputPath} does not exist.`)
    process.exit()
  }

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

  let userConfig: ReactTsConfig = require(path.join(outPath, fileName))
  // @ts-ignore
  if (userConfig.default) userConfig = userConfig.default

  const config = merge<ReactTsConfig>(assignDefaultConfig(userConfig), userConfig)

  return config
}
