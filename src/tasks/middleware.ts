import { exConsole } from '../utils'
import { getConfig } from '../config'

const { START_TYPE } = process.env

const START_TYPE_LIST = [
  'get-config',
  'dev',
  'build',
  'create',
  'add-template',
  '-at',
  'remove-template',
  '-rt',
  'help',
  '-h',
]

if (!START_TYPE || !START_TYPE_LIST.includes(START_TYPE)) {
  exConsole.error(`START_TYPE: ${START_TYPE} ERROR.`)
}

switch (START_TYPE) {
  case 'get-config': {
    getConfig()
    break
  }

  case 'dev': {
    getConfig().then(() => {
      require('./dev-server')
    })
    break
  }

  case 'build': {
    getConfig().then(() => {
      require('./build')
    })
    break
  }

  case 'create': {
    require('./create')
    break
  }

  case '-at':
  case 'add-template': {
    require('./add')
    break
  }

  case '-rt':
  case 'remove-template': {
    require('./remove')
    break
  }

  case '-h':
  case 'help':
  default: {
    const help = [
      'Commands:',
      '  dev [...crossEnv] ···························· 启动本地开发服务',
      '  build [...crossEnv] ·························· 执行生产编译',
      '  create [name] ································ 通过模板快速创建项目',
      '  add-template, -at <gitUrl> [name] ············ 添加模板',
      '  remove-template, -rt [name] ·················· 删除本地模板',
      '  get-config ··································· 编译 config 文件',
      '  help, -h ····································· 显示帮助信息',
      '',
    ]

    console.log(help.join('\n'))
    break
  }
}
