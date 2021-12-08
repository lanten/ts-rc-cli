import { execSync, exec, ExecOptions, ExecSyncOptions } from 'child_process'

import { exConsole } from '.'

export interface ExecParams {
  /** 需要执行的命令 */
  bash: string
  /** 消息 */
  message?: string
  /** 运行目录 */
  cwd?: string
  /** 显示 Loading 状态  */
  showLoading?: boolean
  /** 脚本错误时终止 node 进程 */
  errorExit?: boolean
}

export function asyncExec(paramsSource: (ExecParams & ExecOptions) | string) {
  let params = paramsSource
  if (typeof params === 'string') params = { bash: params }
  const { bash, message, errorExit, showLoading = true, ...execParams } = params

  let stopLoading: ReturnType<typeof exConsole['loading']> | undefined
  if (showLoading) {
    stopLoading = exConsole.loading(`${message} ...`)
  } else {
    exConsole.info(`${message} ...`)
  }

  return new Promise((resolve, reject) => {
    exec(bash, execParams, (error) => {
      if (error) {
        if (stopLoading) {
          stopLoading(`${message}: failed.\n ${error}`, 'ERROR', errorExit)
        } else {
          exConsole.error(`${message}: failed.`, error, errorExit)
        }
        reject(error)
      } else {
        if (stopLoading) {
          stopLoading(`${message}: successfully.`, 'SUCCESS')
        } else {
          exConsole.success(`${message}: successfully.`)
        }
        resolve(void 0)
      }
    })
  })
}

/**
 * 同步执行命令
 * @param paramsSource
 */
export function awaitExec(paramsSource: (Omit<ExecParams, 'showLoading'> & ExecSyncOptions) | string): string {
  let params = paramsSource
  if (typeof params === 'string') params = { bash: params }
  const { bash, message, errorExit } = params

  try {
    const res = execSync(bash, params).toString()
    if (message) exConsole.success(`${message}: successfully.`)
    return res.toString()
  } catch (ex) {
    if (message) exConsole.error(`${message}: failed.\n ${ex}`, ex, errorExit)
    return ex.toString()
  }
}
