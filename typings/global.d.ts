import { ReactTsConfig } from './config'
import { StartType } from '../src/tasks/middleware'

declare global {
  namespace NodeJS {
    interface Global {
      reactTsConfig: ReactTsConfig
    }

    interface ProcessEnv {
      START_TYPE?: StartType
    }
  }
}
