import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import merge from 'webpack-merge'
import { exConsole, asyncExec, clearDir } from '../utils'
import { assignDefaultConfig } from './default.config'
import { ReactTsConfig } from '../../typings'

const { CONFIG_PATH = 'config' } = process.env

const rootPath = process.cwd()
const rootName = path.basename(rootPath)
const inputPath = path.resolve(rootPath, CONFIG_PATH)

// export const reactTsConfig = getConfig(inputPath)

export async function getConfig(inputPathSource: string = inputPath): Promise<ReactTsConfig> {
  const ext = path.extname(inputPathSource)
  const basename = path.basename(inputPathSource, ext)
  const inputPath = ext ? inputPathSource : path.resolve(inputPathSource, 'index.ts')
  const outputFileName = ext ? `${basename}.js` : 'index.js'

  if (!fs.existsSync(inputPath)) {
    exConsole.error(`The configuration file: ${inputPath} does not exist.`, false, true)
  }

  const outPath = path.resolve(__dirname, '../config-dist', rootName)
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
    // '--lib esnext,scripthost,es5',
    `--outDir ${outPath}`,
  ]

  await asyncExec({
    bash: `tsc ${inputPath} ${tscOptions.join(' ')}`,
    message: chalk.cyanBright('Config Compiling'),
    errorExit: true,
  })

  let userConfig: ReactTsConfig = require(path.join(outPath, outputFileName))
  // @ts-ignore
  if (userConfig.default) userConfig = userConfig.default

  global.reactTsConfig = merge<ReactTsConfig>(assignDefaultConfig(userConfig), userConfig)

  return Promise.resolve(global.reactTsConfig)
}
