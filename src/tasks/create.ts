import inquirer from 'inquirer'
import chalk from 'chalk'
import path from 'path'
import fs from 'fs'
import glob from 'glob'
import {
  exConsole,
  syncExec,
  clearDir,
  replaceTemplate,
  handleTemplateRenderContent,
  TemplateRenderRes,
} from '../utils'

const packageJSON = require(path.resolve(__dirname, '../../package.json'))

const templatesPath = path.resolve(__dirname, '../../templates')

/** 预装功能 */
export type PreInstalls =
  /** 是否集成 Redux ($store) */
  | 'USE_REDUX'
  /** 是否启用 Axios ($api) */
  | 'USE_AXIOS'
  /** 是否集成 Ant-Design 及定制主体配置 (将强制启用 less) */
  | 'USE_ANTD'

/** 集成 css 预处理器 */
export type StyleHandlers = 'less' | 'scss' | 'none'

/** 采集用户配置 */
export interface CreateConfig {
  /** 项目名称 */
  PROJECT_NAME: string
  /** 项目标题 */
  PROJECT_TITLE: string
  /** 预装功能 */
  preInstalls: PreInstalls[]
  /** 集成 css 预处理器 */
  styleHandler: StyleHandlers
}

/** 映射到模板中的配置 */
export interface TemplateConfig extends Pick<CreateConfig, 'PROJECT_NAME' | 'PROJECT_TITLE'> {
  /** cli 包名 */
  CLI_PACKAGE_NAME: string
  /** 是否集成 Redux ($store) */
  USE_REDUX?: 0 | 1
  /** 是否启用 Axios ($api) */
  USE_AXIOS?: 0 | 1
  /** 是否集成 Ant-Design 及定制主体配置 (将强制启用 less) */
  USE_ANTD?: 0 | 1
  /** 使用 less */
  USE_LESS?: 0 | 1
  /** 使用 scss */
  USE_SCSS?: 0 | 1
}

export interface TemplateConfigJSON {
  includes?: string[]
}

// -------------------------------------------------------------------------

/** 确认基本信息 */
async function chooseTemplate() {
  const renderText = (text: string, color = '#FE8D00') => chalk.hex(color)(text)
  const splitLine = chalk.gray('-'.repeat(50))

  const startToolTips = [
    splitLine,
    renderText('即将创建模板项目, 在这之前, 请先确认相关信息'),
    splitLine,
    `${renderText('Name           ')}: ${renderText(packageJSON.name, '#66ACEF')}`,
    `${renderText('Description    ')}: ${renderText(packageJSON.description, '#66ACEF')}`,
    `${renderText('Ver            ')}: ${renderText(packageJSON.version, '#66ACEF')}`,
    `${renderText('Ver.Typescript ')}: ${renderText(packageJSON.peerDependencies.typescript, '#66ACEF')}`,
    `${renderText('Ver.Webpack    ')}: ${renderText(packageJSON.peerDependencies.webpack, '#66ACEF')}`,
    splitLine,
  ]

  console.log(startToolTips.join('\n'))

  const templateList = fs.readdirSync(templatesPath).filter((filePath) => {
    const curPath = path.join(templatesPath, filePath)
    if (fs.statSync(curPath).isDirectory()) {
      return fs.existsSync(path.join(curPath, 'template.config.js'))
    }
    return false
  })

  if (!templateList.length) {
    exConsole.error('未找到可用模板，请先添加！')
    process.exit()
  }

  return inquirer
    .prompt<{ templateName: string }>({
      name: 'templateName',
      type: 'list',
      choices: templateList,
      message: '没问题的话，选择一个模板',
    })
    .then((val) => {
      console.log(val)
      if (val && val.templateName) {
        return val.templateName
      } else {
        return Promise.reject(false)
      }
    })
}

/** 询问表单 */
async function getCreateConfig() {
  return inquirer
    .prompt<CreateConfig>([
      { type: 'input', name: 'PROJECT_NAME', message: '项目名称', validate: requiredValidate },
      {
        type: 'input',
        name: 'PROJECT_TITLE',
        message: '项目标题',
        default: (e: CreateConfig) => e.PROJECT_NAME,
        validate: requiredValidate,
      },
      {
        type: 'checkbox',
        name: 'preInstalls',
        message: '选择需要预装的功能',
        default: [
          'USE_REDUX',
          'USE_AXIOS',
          'USE_GLOBAL_TOOLS',
          'USE_REACT_ROUTER',
          'USE_ANTD',
        ] as PreInstalls[],
        choices: [
          { value: 'USE_REDUX', name: '集成 Redux ($store)' },
          { value: 'USE_AXIOS', name: '是否启用 Axios ($api)' },
          // { value: 'USE_GLOBAL_TOOLS', name: '启用全局工具模块 ($tools)' },
          // { value: 'USE_REACT_ROUTER', name: '集成 react-router 及相关路由模块' },
          { value: 'USE_ANTD', name: '集成 Ant-Design 及定制主体配置 (将强制启用 less)' },
        ] as {
          value: PreInstalls
          name: string
        }[],
      },
      {
        type: 'list',
        name: 'styleHandler',
        message: '选择 css 预处理器',
        default: 'less' as StyleHandlers,
        choices: [{ value: 'less' }, { value: 'scss' }, { value: 'none' }] as { value: StyleHandlers }[],
        when: (e) => !e.preInstalls.includes('USE_ANTD'),
      },
    ])
    .then((res) => {
      if (res.preInstalls.includes('USE_ANTD')) {
        res.styleHandler = 'less'
      }

      const templateConfig: TemplateConfig = {
        CLI_PACKAGE_NAME: packageJSON.name,
        PROJECT_NAME: res.PROJECT_NAME,
        PROJECT_TITLE: res.PROJECT_TITLE,
      }

      res.preInstalls.forEach((v) => {
        templateConfig[v] = 1
      })

      switch (res.styleHandler) {
        case 'less':
          templateConfig.USE_LESS = 1
          break

        case 'scss':
          templateConfig.USE_SCSS = 1
          break
      }

      createTemplate(templateConfig)
      return res
    })
    .catch((error) => {
      console.log(error)
    })
}

/** 获取创建目录 */
async function getCreatePath(name: string): Promise<string> {
  const bash = process.platform == 'win32' ? 'chdir' : 'pwd'
  const runPath = syncExec({ bash }).trim()

  if (!fs.existsSync(runPath)) {
    exConsole.error('获取运行路径失败')
    process.exit()
  }

  const createPath = path.resolve(runPath, name)

  if (fs.existsSync(createPath)) {
    await inquirer
      .prompt({
        name: 'next',
        type: 'confirm',
        message: `${chalk.red(`文件夹: [${name}] 已存在`)} 确认清空目录后继续?`,
      })
      .then((val) => {
        if (val && val.next) {
          console.log(createPath)
          clearDir(createPath, true, false, true)
          return Promise.resolve(createPath)
        } else {
          // return Promise.reject(false)
          process.exit()
        }
      })
  }

  return Promise.resolve(createPath)
}

/** 创建模板项目 */
async function createTemplate(conf: TemplateConfig) {
  const createPath = await getCreatePath(conf.PROJECT_NAME)
  const templatePath = path.resolve(__dirname, '../../react-ts-template')

  if (!templatePath) return exConsole.warn('[clearDir]: Empty Path!')

  let templateConfigFN = require(path.resolve(templatePath, 'template.config.js'))
  if (templateConfigFN.default) templateConfigFN = templateConfigFN.default
  const templateConfigJSON = templateConfigFN(conf)
  const filePaths = handleTemplateFiles(templatePath, templateConfigJSON.includes, templateConfigJSON.ignore)
  // console.log(filePaths, conf) // DEBUG
  filePaths.forEach((v) => copyTemplateFile(templatePath, createPath, v, conf))

  console.log('\n')
  exConsole.success(`[Create] Successfully created. ${chalk.underline(createPath)}\n`)

  exConsole.info(`[Next] cd ${conf.PROJECT_NAME}`)
  exConsole.info(`[Next] yarn ${chalk.gray('or')} npm i\n`)
}

/**
 * 解析需要复制的模板文件
 * @param pathStr
 * @param includes
 */
function handleTemplateFiles(
  pathStr: string,
  includes: TemplateConfigJSON['includes'] = ['**/*'],
  ignore?: string | string[]
): string[] {
  const allPaths: string[] = []

  includes.forEach((includePath) => {
    let includePathH = includePath

    try {
      if (fs.statSync(path.resolve(pathStr, includePath)).isDirectory()) {
        includePathH = `${includePath}/**/*`
        allPaths.push(includePath)
      }
    } catch (error) {}

    const files = glob.sync(includePathH, { cwd: pathStr, ignore })

    allPaths.push(...files)
  })

  return allPaths
}

/**
 * 复制模板文件
 * @param filePath
 * @param newPath
 * @param relativePath
 * @param conf
 * @returns
 */
function copyTemplateFile(filePath: string, newPath: string, relativePath: string, conf: TemplateConfig): void {
  const sourcePath = path.resolve(filePath, relativePath)
  let newPathH = path.resolve(newPath, relativePath)

  // 创建目录
  if (fs.statSync(sourcePath).isDirectory()) {
    fs.mkdirSync(newPathH, { recursive: true })
    exConsole.info(`[Create Dir] ${newPathH}`)
    return
  }

  let fileData = fs.readFileSync(sourcePath, { encoding: 'utf-8' })

  // 字符串替换处理方案
  if (/\.replace$/.test(relativePath)) {
    newPathH = newPathH.replace(/\.replace$/, '')
    fileData = replaceTemplate(fileData, conf)
  }

  // 函数处理方案
  if (/\.render\.js$/.test(relativePath)) {
    let render = require(sourcePath)
    if (render.default) render = render.default
    const templateRes: TemplateRenderRes = render(conf)

    // 忽略文件复制
    if (templateRes.ignore) return

    if (templateRes.fileName) {
      newPathH = newPathH.replace(/^(.+)\/.+$/, `$1/${templateRes.fileName}`)
    } else {
      newPathH = newPathH.replace(/\.render\.js$/, '')
    }

    fileData = handleTemplateRenderContent(templateRes instanceof Array ? templateRes : templateRes.content)
  }

  // 输出文件
  try {
    fs.writeFileSync(newPathH, fileData, { encoding: 'utf-8' })
    exConsole.info(`[Create File] ${newPathH}`)
  } catch (err) {
    exConsole.error(`[Create File] ${newPathH}`)
    exConsole.error(err)
  }
}

/** 必填项验证 */
function requiredValidate(input: string) {
  if ([undefined, null, ''].includes(input)) {
    return '你必须必填写!'
  } else {
    return true
  }
}

// --------------------------------------------------------------------------------

chooseTemplate()
  .then((templateName) => {
    console.log('选择了模板：', templateName)
    getCreateConfig()
  })
  .catch((message) => {
    exConsole.warn(message || '配置异常!')
  })

// test // DEBUG
// createTemplate({
//   CLI_PACKAGE_NAME: 'ts-rc-cli',
//   PROJECT_NAME: 'asd',
//   PROJECT_TITLE: 'asd',
//   USE_REDUX: 0,
//   USE_AXIOS: 0,
//   USE_GLOBAL_TOOLS: 0,
//   USE_REACT_ROUTER: 1,
//   USE_ANTD: 1,
//   USE_LESS: 1,
// })
