import path from 'path'
import { ReactTsConfig, ReactTsConfigPartial } from '@/typings'

const rootPath = process.cwd()

export function assignDefaultConfig(userConfig: ReactTsConfigPartial): ReactTsConfig {
  const { projectName = 'new-project', projectTitle = 'New Project' } = userConfig

  return {
    projectName,
    projectTitle,
    port: 18081,
    dist: path.resolve(rootPath, 'dist'),
    host: '0.0.0.0',

    devServerOptions: {
      client: {
        // noInfo: true,
        logging: 'warn',
        overlay: true,
        progress: true,
      },
      historyApiFallback: true,
      compress: true,
      allowedHosts: 'all',
      devMiddleware: {
        publicPath: '',
      },
    },

    terserOptions: {
      terserOptions: {
        compress: {
          // 生产环境移除 log
          pure_funcs: ['console.log'],
        },
      },
      extractComments: false, // 不提取任何注释
    },

    alias: {
      '@': path.resolve(rootPath, 'src'),
    },

    provide: {},

    proxy: {},

    COMMON_ENV: {
      BUILD_ENV: process.env.BUILD_ENV,
      NODE_ENV: process.env.NODE_ENV as any,
      PROJECT_NAME: projectName,
      PROJECT_TITLE: projectTitle,
    },

    env: {
      mock: {
        publicPath: '',
        variables: {},
      },

      dev: {
        publicPath: '',
        variables: {},
      },

      prod: {
        publicPath: '',
        variables: {},
      },
    },

    postcssOptions: void 0,
    htmlOptions: {
      filename: 'index.html',
      templateParameters: {
        title: `${projectTitle}`,
        lang: 'zh-CN',
        keywords: `${projectTitle}`,
      },
    },
    lessOptions: {
      javascriptEnabled: true,
    },
  }
}
