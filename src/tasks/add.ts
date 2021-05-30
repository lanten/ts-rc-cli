import path from 'path'
import chalk from 'chalk'

import { exConsole, asyncExec } from '../utils'

const sourceArgv = process.env.SOURCE_ARGV?.split(',') || []
const templatesDir = path.resolve(__dirname, '../../templates')
const gitUrl = sourceArgv[3]
let templateName = sourceArgv[4] || ''

if (!gitUrl) {
  exConsole.error(
    '[Add Template] Required parameters are missing: please pass in the git repository address.',
    false,
    true
  )
} else if (!/^(http(s)?:\/\/([^\/]+?\/){2}|git@[^:]+:[^\/]+?\/).*?\.git$/.test(gitUrl)) {
  exConsole.error(
    '[Add Template] Git repository address format error. support: http | https | ssh',
    false,
    true
  )
}

if (!templateName) {
  templateName = gitUrl.replace(/^.*[\/\\](.*?)\.git$/, '$1')
}

asyncExec({ cwd: templatesDir, bash: `git clone ${gitUrl} ${templateName}`, message: 'Clone Template' }).then(
  () => {
    exConsole.success(`Successfully added the template ${chalk.blue(templateName)}.`)
  }
)
