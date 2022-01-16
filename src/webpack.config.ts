import webpack, { Configuration, RuleSetUseItem } from 'webpack'

import Webpackbar from 'webpackbar'
import ESLintPlugin from 'eslint-webpack-plugin'
import htmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import tsImportPluginFactory from 'ts-import-plugin'
import merge from 'webpack-merge'

const reactTsConfig = global.reactTsConfig

const {
  dist,
  alias,
  provide,
  env,
  COMMON_ENV,
  devServerOptions,
  entry,
  configureWebpack,
  postcssOptions,
  cssMinimizerOptions,
  terserOptions,
  htmlOptions,
  moduleFederationOptions,
  eslintOptions,
  lessOptions,
  sassOptions,
} = reactTsConfig
const { NODE_ENV, BUILD_ENV = 'dev' } = process.env
const ENV_CONFIG = env[BUILD_ENV]

const tsLoader: webpack.RuleSetUseItem = {
  loader: 'ts-loader',
  options: {
    transpileOnly: true,
    getCustomTransformers: (): any => ({
      before: [tsImportPluginFactory(/** options */)],
    }),
    // compilerOptions: {
    //   module: 'es2015',
    // },
  },
}

const styleLoader: RuleSetUseItem[] = [{ loader: 'css-loader' }]

if (postcssOptions) {
  styleLoader.push({ loader: 'postcss-loader', options: postcssOptions })
}

if (NODE_ENV === 'development') {
  styleLoader.unshift({ loader: 'css-hot-loader' }, { loader: 'style-loader' })
} else {
  styleLoader.unshift({ loader: MiniCssExtractPlugin.loader })
}

let webpackConfig: Configuration = {
  mode: NODE_ENV as 'development' | 'production',
  target: 'web',

  entry,

  resolve: {
    alias,
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },

  output: {
    publicPath:
      NODE_ENV === 'development' ? devServerOptions?.devMiddleware?.publicPath || '/' : ENV_CONFIG.publicPath,
    path: dist,
    filename: 'js/[name].[fullhash:7].js',
    chunkFilename: 'js/[name].[chunkhash:7].js',
  },

  module: {
    rules: [
      {
        test: /(?<!\.d)\.tsx?$/,
        use: [tsLoader],
      },
      {
        test: /\.jsx?$/,
        use: [tsLoader],
        exclude: /node_modules/,
      },
      {
        test: /\.(less)$/,
        use: [
          ...styleLoader,
          {
            loader: 'less-loader',
            options: {
              lessOptions,
            },
          },
        ],
      },
      {
        test: /\.(scss|sass)$/,
        use: [
          ...styleLoader,
          {
            loader: 'sass-loader',
            options: sassOptions,
          },
        ],
      },
      {
        test: /\.css$/,
        use: styleLoader,
      },
      {
        test: /\.(png|jpe?g|gif|svg|swf|woff2?|eot|ttf|otf)(\?.*)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name]-[hash:7].[ext]',
        },
      },
    ],
  },

  plugins: [
    new htmlWebpackPlugin(htmlOptions),
    new ESLintPlugin(eslintOptions),
    new webpack.DefinePlugin(
      ((): { [key: string]: string | Record<string, any> } => {
        const defines = {}
        const variables = Object.assign({}, COMMON_ENV, ENV_CONFIG.variables)
        Object.keys(variables).forEach((key) => {
          const val = variables[key]
          defines[`process.env.${key}`] = typeof val === 'string' ? `"${val}"` : JSON.stringify(val)
        })
        return defines
      })()
    ),

    new Webpackbar({}),

    new MiniCssExtractPlugin({
      filename: 'css/[name].[fullhash:7].css',
      chunkFilename: 'css/[name].[chunkhash:7].css',
    }) as any,

    new webpack.ProvidePlugin({
      process: 'process/browser',
      ...provide,
    }),
  ],
}

if (moduleFederationOptions) {
  webpackConfig.plugins?.push(new webpack.container.ModuleFederationPlugin(moduleFederationOptions))
}

// 开发环境配置
if (NODE_ENV === 'development') {
  webpackConfig.devtool = 'eval-source-map'
  // webpackConfig.plugins?.push(new webpack.HotModuleReplacementPlugin(), new webpack.NoEmitOnErrorsPlugin())
  // 生产环境配置
} else if (NODE_ENV === 'production') {
  webpackConfig.optimization = {
    minimizer: [
      // https://github.com/webpack-contrib/css-minimizer-webpack-plugin
      new CssMinimizerPlugin(cssMinimizerOptions),
      // https://github.com/terser-js/terser
      new TerserPlugin(terserOptions),
    ],
  }
}

if (configureWebpack) {
  webpackConfig = merge(webpackConfig, configureWebpack(webpackConfig))
}

export default webpackConfig
