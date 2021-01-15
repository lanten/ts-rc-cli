import webpack, { Configuration } from 'webpack'

import { reactTsConfig } from '../config'

const { env: envConfig } = reactTsConfig

interface BuildConfig {
  env: string
  webpackConfig: Configuration
}

function build({ env, webpackConfig }: BuildConfig): Promise<any> {
  return new Promise((resolve, reject) => {
    webpack(webpackConfig, (err, stats) => {
      if (err) {
        throw err
      }

      if (!stats) {
        throw `Webpack stats error: ${stats}`
      }

      process.stdout.write(
        stats.toString({
          colors: true,
          hash: true,
          version: true,
          timings: true,
          assets: true,
          chunks: false,
          children: false,
          modules: false,
        }) + '\n\n'
      )

      if (stats.hasErrors()) {
        reject(stats)
      } else {
        resolve(envConfig[env])
      }
    })
  })
}

export default build
