import path from 'path'
import fs from 'fs'
import inquirer from 'inquirer'
import chalk from 'chalk'

import { exConsole, asyncClearDir } from '../utils'

const sourceArgv = process.env.SOURCE_ARGV?.split(',') || []
const inputTemplateName = sourceArgv[3]

const templatesDir = path.resolve(__dirname, '../../templates')

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
      message: 'Please select the template to be removed',
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
    exConsole.error(`Removal failed. template does not exist. ${chalk.blue(templateName)}`, false, true)
  } else {
    inquirer
      .prompt({
        name: 'next',
        type: 'confirm',
        message: chalk.yellow(`Local template will be removed: ${templateName}. Please confirm twice.`),
      })
      .then(async (val) => {
        if (val && val.next) {
          const stop = exConsole.loading('Removing ...')
          await asyncClearDir(templatePath, true)
          stop('Removed successfully.', 'SUCCESS')
        } else {
          exConsole.info('User canceled operation.')
          process.exit()
        }
      })
  }
}
