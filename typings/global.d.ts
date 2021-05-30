import { ReactTsConfig } from './config'

declare global {
  namespace NodeJS {
    interface Global {
      reactTsConfig: ReactTsConfig
    }
  }
}
