import path from 'path'
import chalk from 'chalk'

import { exConsole, syncExec } from '../utils'

const sourceArgv = process.env.SOURCE_ARGV?.split(',') || []
const templatesDir = path.resolve(__dirname, '../../templates')
const gitUrl = sourceArgv[3]
const templateName = sourceArgv[4] || ''

if (!gitUrl) {
  exConsole.error('必要参数缺失：请传入 git-url', false, true)
} else if (!/^(http(s)?:\/\/([^\/]+?\/){2}|git@[^:]+:[^\/]+?\/).*?\.git$/.test(gitUrl)) {
  exConsole.error('git-url 格式错误，支持 http | https | ssh', false, true)
}

// if (!templateName) {
//   templateName = gitUrl.replace(/^.*[\/\\](.*?)\.git$/, '$1')
// }

// console.log(templateName)
exConsole.warn(`正在拉取模板 <${chalk.blue(gitUrl)}> ...`)
syncExec({ inputPath: templatesDir, bash: `git clone ${gitUrl} ${templateName}`, msg: '拉取模板' })
