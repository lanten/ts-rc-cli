import { exConsole } from '../utils'

const { START_TYPE } = process.env

const START_TYPE_LIST = ['dev', 'build', 'create']

if (!START_TYPE || !START_TYPE_LIST.includes(START_TYPE)) {
  exConsole.error(`START_TYPE: ${START_TYPE} ERROR. Optional: [${START_TYPE_LIST.join(' | ')}]`)
  process.exit()
}

switch (START_TYPE) {
  case 'create': {
    require('./create')
    break
  }

  case 'dev': {
    require('./dev-server')
    break
  }

  case 'build': {
    require('./build')
    break
  }
}
