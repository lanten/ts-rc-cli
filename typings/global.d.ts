import { ReactTsConfig } from './config'
import { StartType } from '../src/tasks/middleware'

declare global {
  // eslint-disable-next-line no-var
  declare var reactTsConfig: ReactTsConfig

  namespace NodeJS {
    interface ProcessEnv {
      START_TYPE?: StartType
    }
  }
}
