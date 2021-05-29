import path from 'path'
import fs from 'fs'
import inquirer from 'inquirer'
import chalk from 'chalk'

import { exConsole, clearDir } from '../utils'

const templatesDir = path.resolve(__dirname, '../../templates')
const sourceArgv = process.env.SOURCE_ARGV?.split(',') || []
const inputTemplateName = sourceArgv[3]

const templateList = fs.readdirSync(templatesDir).filter((filePath) => {
  const curPath = path.join(templatesDir, filePath)
  return fs.statSync(curPath).isDirectory()
})

if (inputTemplateName) {
  removeTemplate(inputTemplateName)
} else {
  inquirer
    .prompt<{ templateName: string }>({
      name: 'templateName',
      type: 'list',
      choices: templateList,
      message: '请选择需要删除的模板',
    })
    .then((val) => {
      if (val && val.templateName) {
        removeTemplate(val.templateName)
      }
    })
}

/**
 * 删除指定模板
 * @param templateName 模板名称
 */
function removeTemplate(templateName: string) {
  const templatePath = path.join(templatesDir, templateName)

  if (!fs.existsSync(templatePath)) {
    exConsole.error(`删除失败：指定模板不存在 [${chalk.yellow(templateName)}]`, false, true)
  } else {
    inquirer
      .prompt({
        name: 'next',
        type: 'confirm',
        message: chalk.yellow(`即将删除本地模板: [${templateName}] 请二次确认`),
      })
      .then((val) => {
        if (val && val.next) {
          const stop = exConsole.loading('正在删除...')
          clearDir(templatePath, true)
          stop('SUCCESS', '删除成功')
        } else {
          exConsole.info('用户取消操作')
          process.exit()
        }
      })
  }
}
