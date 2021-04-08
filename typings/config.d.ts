import webpack, { Configuration } from 'webpack'
import { Configuration as DevServerConfiguration } from 'webpack-dev-server'
import { TerserPluginOptions } from 'terser-webpack-plugin'
import { Options as HtmlOptions } from 'html-webpack-plugin'
import { Options as ESLintOptions } from 'eslint-webpack-plugin'

export type ModuleFederationPluginOptions = ConstructorParameters<
  typeof webpack.container.ModuleFederationPlugin
>[0]

export declare interface EnvVariables {
  /** 项目名称 */
  PROJECT_NAME?: string
  /** 项目标题 */
  PROJECT_TITLE?: string
  /** api 请求地址 */
  API_BASE?: string
}

export declare interface EnvOptions<V = EnvVariables> {
  /** publicPath */
  publicPath: string
  /** 注入到 process.env 中的变量 */
  variables: V
}

export declare interface ReactTsConfig<V = EnvVariables> {
  /** 项目名称 */
  projectName: string
  /** 项目标题 */
  projectTitle: string
  /** 本地服务端口 默认: 18081 */
  port: number
  /** 入口文件配置 默认: 'src/index.ts' */
  entry?: Configuration['entry']
  /** 编译输出目录 默认: dist */
  dist: string
  /** 本地 host, 需要手动修改 默认: localhost */
  host: string
  /** webpack-dev-server 相关配置 */
  devServerOptions?: DevServerConfiguration
  /** 路径别名 默认 */
  alias: {
    [key: string]: string
  }
  /** 全局加载的文件 */
  provide: {
    [key: string]: any
  }
  /** webpack.config 配置 */
  configureWebpack?: (webpackConfig: Configuration) => Configuration
  /** dev-server 中使用的代理配置 */
  proxy: any
  /** 公共环境变量 */
  COMMON_ENV: V
  /** 环境变量 */
  env: {
    [key: string]: EnvOptions
  }
  /** postcss 相关配置 */
  postcssOptions?: {
    /** Enable PostCSS Parser support in CSS-in-JS */
    execute?: boolean
    sourceMap?: boolean
    postcssOptions?:
      | ({
          /**	Enable PostCSS Parser support in CSS-in-JS */
          exec?: boolean
          /** Set PostCSS Parser */
          parser?: string | Record<string, unknown>
          /** Set PostCSS Syntax */
          syntax?: string | Record<string, unknown>
          /** Set PostCSS Stringifier */
          stringifier?: string | Record<string, unknown>
          /** Set postcss.config.js config path && ctx */
          config?: Record<string, unknown>
          /** Set PostCSS Plugins */
          plugins?: any[] | any
          /** Enable Source Maps */
          sourceMap?: string | boolean
          ident?: string
        } & any)
      | (() => any)
  }

  terserOptions?: TerserPluginOptions
  htmlOptions?: HtmlOptions
  moduleFederationOptions?: ModuleFederationPluginOptions
  eslintOptions?: ESLintOptions
}

export type ReactTsConfigPartial<T = EnvVariables> = Partial<ReactTsConfig<T>>

// declare global {
//   namespace NodeJS {
//     interface ProcessEnv extends EnvVariables {}
//   }
// }
