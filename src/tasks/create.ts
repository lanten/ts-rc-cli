import inquirer from 'inquirer'
import chalk from 'chalk'
import path from 'path'
import fs from 'fs'
import glob from 'glob'
import {
  exConsole,
  awaitExec,
  clearDir,
  replaceTemplate,
  handleTemplateRenderContent,
  TemplateRenderRes,
} from '../utils'

const sourceArgv = process.env.SOURCE_ARGV?.split(',') || []
const CREATE_PROJECT_NAME = sourceArgv[3]

const packageJSON = require(path.resolve(__dirname, '../../package.json'))
const templatesDir = path.resolve(__dirname, '../../templates')

/** 采集用户配置 */
export interface CreateConfig {
  /** 项目名称 */
  PROJECT_NAME: string
  /** 项目标题 */
  PROJECT_TITLE: string
}

/** 映射到模板中的配置 */
export interface TemplateConfig extends Pick<CreateConfig, 'PROJECT_NAME' | 'PROJECT_TITLE'> {
  /** cli 包名 */
  CLI_PACKAGE_NAME: string
  /** cli 版本 */
  CLI_PACKAGE_VERSION: string
  /** 自定义变量 */
  [k: string]: any
}

// -------------------------------------------------------------------------

/** 确认基本信息 */
async function chooseTemplate() {
  const renderText = (text: string, color = '#FE8D00') => chalk.hex(color)(text)
  const splitLine = chalk.gray('-'.repeat(50))

  const startToolTips = [
    splitLine,
    renderText('Typescript + React + Webpack'),
    splitLine,
    `${renderText('Name           ')}: ${renderText(packageJSON.name, '#66ACEF')}`,
    `${renderText('Description    ')}: ${renderText(packageJSON.description, '#66ACEF')}`,
    `${renderText('Ver            ')}: ${renderText(packageJSON.version, '#66ACEF')}`,
    `${renderText('Ver.Typescript ')}: ${renderText(packageJSON.peerDependencies.typescript, '#66ACEF')}`,
    `${renderText('Ver.Webpack    ')}: ${renderText(packageJSON.peerDependencies.webpack, '#66ACEF')}`,
    splitLine,
  ]

  console.log(startToolTips.join('\n'))

  const templateList = fs.readdirSync(templatesDir).filter((filePath) => {
    const curPath = path.join(templatesDir, filePath)
    if (fs.statSync(curPath).isDirectory()) {
      return fs.existsSync(path.join(curPath, 'template.config.js'))
    }
    return false
  })

  if (!templateList.length) {
    exConsole.error('No available template was found, please add one first!')
    process.exit()
  }

  return inquirer
    .prompt<{ templateName: string }>({
      name: 'templateName',
      type: 'list',
      choices: templateList,
      message: 'All ready! Continue after choosing a template:',
    })
    .then((val) => {
      if (val && val.templateName) {
        return val.templateName
      } else {
        return Promise.reject(false)
      }
    })
}

/**
 * 询问表单
 * @param templateName 模板名称
 * @returns
 */
async function getCreateConfig(templateName: string) {
  const templateConfig = require(path.join(templatesDir, templateName, 'template.config.js'))
  const { inquirerConfig, inquirerHandler } = templateConfig || {}
  if (inquirerConfig) {
    return inquirer
      .prompt<any>(inquirerConfig(CREATE_PROJECT_NAME))
      .then((res) => {
        const templateConfig: TemplateConfig = {
          CLI_PACKAGE_NAME: packageJSON.name,
          CLI_PACKAGE_VERSION: packageJSON.version,
          PROJECT_NAME: res.PROJECT_NAME,
          PROJECT_TITLE: res.PROJECT_TITLE,
        }

        if (inquirerHandler) {
          // 后处理合并
          Object.assign(templateConfig, inquirerHandler(res, templateConfig))
        }

        console.log({ templateConfig })

        createTemplate(templateConfig, templateName)

        return res
      })
      .catch((error) => {
        console.log(error)
      })
  } else {
    Promise.resolve()
  }
}

/** 获取创建目录 */
async function getCreatePath(name: string): Promise<string> {
  const bash = process.platform == 'win32' ? 'chdir' : 'pwd'
  const runPath = awaitExec({ bash }).trim()

  if (!fs.existsSync(runPath)) {
    exConsole.error('[Create] Failed to get the running path.')
    process.exit()
  }

  const createPath = path.resolve(runPath, name)

  if (fs.existsSync(createPath)) {
    await inquirer
      .prompt({
        name: 'next',
        type: 'confirm',
        message: `${chalk.red(
          `Folder: ${chalk.blue(name)} already exists.`
        )} Continue after emptying the directory?`,
      })
      .then((val) => {
        if (val && val.next) {
          const stop = exConsole.loading(`[Clear Dir] ${chalk.blue(createPath)} deleting...`)
          clearDir(createPath, true, false, true)
          stop('SUCCESS', `[Clear Dir] <${createPath}> deleted.`)
          return Promise.resolve(createPath)
        } else {
          exConsole.info('User canceled operation.')
          process.exit()
        }
      })
  }

  return Promise.resolve(createPath)
}

/** 创建模板项目 */
async function createTemplate(conf: TemplateConfig, templateName: string) {
  const createPath = await getCreatePath(conf.PROJECT_NAME)
  const templatePath = path.join(templatesDir, templateName)

  if (!templatePath) return exConsole.warn('[Create] Empty template Path!')

  let templateConfigFN = require(path.resolve(templatePath, 'template.config.js'))
  if (templateConfigFN.default) templateConfigFN = templateConfigFN.default
  const templateConfigJSON = templateConfigFN(conf)
  const filePaths = handleTemplateFiles(templatePath, templateConfigJSON.includes, templateConfigJSON.ignore)
  // console.log(filePaths, conf) // DEBUG
  filePaths.forEach((v) => copyTemplateFile(templatePath, createPath, v, conf))

  console.log('\n')
  exConsole.success(`Successfully created. ${chalk.underline(createPath)}\n`)

  exConsole.info(`[Next] cd ${conf.PROJECT_NAME}`)
  exConsole.info(`[Next] yarn ${chalk.gray('or')} npm i\n`)
}

/**
 * 解析需要复制的模板文件
 * @param pathStr
 * @param includes
 */
function handleTemplateFiles(pathStr: string, includes = ['**/*'], ignore?: string | string[]): string[] {
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
    exConsole.info(`Create Dir ${newPathH}`)
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
    exConsole.error(`[Create File] ${newPathH}`, err)
  }
}

// --------------------------------------------------------------------------------

chooseTemplate()
  .then((templateName) => {
    getCreateConfig(templateName)
  })
  .catch((message) => {
    exConsole.warn(message || 'Configuration Error!')
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
