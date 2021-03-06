import chalk from 'chalk'
import { awaitClearDir, exConsole } from '../utils'

import webpackConfig from '../webpack.config'
import buildCommon from './build-common'

const reactTsConfig = global.reactTsConfig
const env = process.env.BUILD_ENV || 'dev'

async function buildRenderer() {
  return buildCommon({ env, webpackConfig: webpackConfig }).then(() => {
    exConsole.success('[Build] Successfully.')
  })
}

function build() {
  exConsole.info(chalk.cyanBright(`Clear Dir ... ${chalk.magenta.underline(reactTsConfig.dist)}`))

  try {
    awaitClearDir(reactTsConfig.dist, false, true)
  } catch (error) {
    exConsole.warn(error.message)
  }

  exConsole.info(`Building ${chalk.cyanBright(env)} ...`)
  exConsole.info(
    `NODE_ENV: ${chalk.yellowBright(process.env.NODE_ENV)} BUILD_ENV: ${chalk.yellow(`[ ${env} ]`)}`
  )

  Promise.all([buildRenderer()])
    .then(() => {
      exConsole.info('[Build] All Done.')
    })
    .finally(() => process.exit())
    .catch((err) => {
      throw new Error(err)
    })
}

build()
