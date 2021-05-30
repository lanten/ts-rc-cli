import chalk from 'chalk'
import path from 'path'
import webpack from 'webpack'
import address from 'address'
import defaultGateway from 'default-gateway'
import WebpackDevServer, { Configuration } from 'webpack-dev-server'

import { exConsole } from '../utils'
import webpackConfig from '../webpack.config'

const { port, proxy, host: devHost, projectName, devServerOptions: devServerOptionsUser } = global.reactTsConfig

process.env.NODE_ENV = 'development'
const { BUILD_ENV = 'dev' } = process.env

const gatewayResult = defaultGateway.v4.sync()
const ip = address.ip(gatewayResult && gatewayResult.interface)
const protocol = devServerOptionsUser?.https ? 'https' : 'http'

for (const key in proxy) {
  const val = proxy[key]
  if (typeof val === 'string') {
    proxy[key] = { target: val }
  }
  proxy[key].target = val.target.replace(/\{(.+)\}/g, (_: string, type: string) => {
    return process.env[type]
  })
}

const host = devHost || ip || '0.0.0.0'
const devServerOptions: WebpackDevServer.Configuration = {
  host,
  proxy,
  hot: true,
  noInfo: true,
  clientLogLevel: 'warn',
  historyApiFallback: true,
  compress: true,
  ...devServerOptionsUser,
}

function startRenderer(): Promise<webpack.Stats> {
  return new Promise((resolve) => {
    process.env.port = String(port)
    process.env.host = host

    WebpackDevServer.addDevServerEntrypoints(webpackConfig as Configuration, devServerOptions)

    webpackConfig.devtool = 'source-map'

    const rendererCompiler = webpack(webpackConfig)
    rendererCompiler.hooks.done.tap('done', (stats) => {
      const { publicPath = '' } = devServerOptions
      const isAbs = /^https?.+$/.test(publicPath)
      const localUrl = isAbs ? publicPath : `${protocol}://${path.join(`${host}:${port}`, publicPath)}`
      exConsole.success(`Dev Server started. (${chalk.yellow(`${projectName} | ${BUILD_ENV}`)})`)
      exConsole.info(`${chalk.dim('[ HOST ]')}: ${chalk.magenta.underline(localUrl)}`)

      if (!isAbs) {
        const ipUrl = `${protocol}://${path.join(`${ip}:${port}`, publicPath)}`
        exConsole.info(`${chalk.dim('[ IP   ]')}: ${chalk.magenta.underline(ipUrl)}`)
      }
      resolve(stats)
    })

    const server = new WebpackDevServer(rendererCompiler as any, devServerOptions)

    server.listen(port, (err) => {
      if (err) {
        exConsole.error('Dev Server failed to activate.', err)
      }
    })
  })
}

async function startDevServer() {
  exConsole.info(
    chalk.cyanBright(`BUILD_ENV: ${chalk.bgRedBright(`  ${BUILD_ENV}  `)} Dev Server Starting ...`)
  )
  await startRenderer()
}

startDevServer()
