import chalk from 'chalk'
import path from 'path'
import webpack from 'webpack'
import address from 'address'
import defaultGateway from 'default-gateway'
import WebpackDevServer from 'webpack-dev-server'

import { exConsole } from '../utils'
import webpackConfig from '../webpack.config'

const { port, proxy, host: devHost, projectName, devServerOptions = {} } = global.reactTsConfig

process.env.NODE_ENV = 'development'
const { BUILD_ENV = 'dev' } = process.env

const gatewayResult = defaultGateway.v4.sync()
const ip = address.ip(gatewayResult && gatewayResult.interface)
const protocol = devServerOptions?.https ? 'https' : 'http'

for (const key in proxy) {
  const val = proxy[key]
  if (typeof val === 'string') {
    proxy[key] = { target: val }
  }
  proxy[key].target = val.target.replace(/\{(.+)\}/g, (_: string, type: string) => {
    return process.env[type]
  })
}

const host = devHost || devServerOptions.host || ip || '0.0.0.0'
devServerOptions.host = host
devServerOptions.port = port
devServerOptions.proxy = proxy

function startRenderer(): Promise<webpack.Stats> {
  return new Promise((resolve) => {
    process.env.port = String(port)
    process.env.host = host

    webpackConfig.infrastructureLogging = {
      level: 'warn',
      appendOnly: true,
    }

    webpackConfig.stats = 'errors-warnings'

    const rendererCompiler = webpack(webpackConfig)
    rendererCompiler.hooks.done.tap('done', (stats) => {
      const publicPath = (devServerOptions.devMiddleware?.publicPath ||
        webpackConfig.output?.publicPath ||
        '') as string
      const isAbs = /^https?.+$/.test(publicPath)
      const localUrl = isAbs
        ? publicPath
        : `${protocol}://${path.join(`${host === '0.0.0.0' ? 'localhost' : host}:${port}`, publicPath)}`
      exConsole.success(`Dev Server started. (${chalk.yellow(`${projectName} | ${BUILD_ENV}`)})`)
      exConsole.info(`${chalk.dim('[ HOST ]')}: ${chalk.magenta.underline(localUrl)}`)

      if (!isAbs) {
        const ipUrl = `${protocol}://${path.join(`${ip}:${port}`, publicPath)}`
        exConsole.info(`${chalk.dim('[ IP   ]')}: ${chalk.magenta.underline(ipUrl)}`)
      }
      resolve(stats)
    })

    const server = new WebpackDevServer(devServerOptions, rendererCompiler as any)

    server.start().catch((err) => {
      if (err) {
        exConsole.error('Dev Server failed to activate.', err)
      }
    })
  })
}

async function startDevServer() {
  exConsole.info(chalk.cyanBright(`BUILD_ENV: ${chalk.yellow(`[ ${BUILD_ENV} ]`)} Dev Server Starting ...`))
  await startRenderer()
}

startDevServer()
