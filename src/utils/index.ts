import fs from 'fs'
import path from 'path'
import { execSync, exec, ExecOptions, ExecSyncOptions } from 'child_process'

import { exConsole } from './console'
export * from './console'
export * from './template-parser'

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

/**
 * 清空文件夹
 *
 * @param {String} pathStr 要清空的文件夹路径
 * @param {Boolean} delDir 清空完成后是否删除文件夹
 * @param {Boolean} createDir 如果不存在,是否创建
 * @param {Boolean} log 是否输出日志
 */
export function clearDir(pathStr?: string, delDir?: boolean, createDir?: boolean, log?: boolean): void {
  if (!pathStr) return exConsole.warn('[Clear Dir]: Empty Path!')
  let files = []

  if (fs.existsSync(pathStr)) {
    files = fs.readdirSync(pathStr)
    files.forEach((file) => {
      const curPath = path.join(pathStr, file)

      if (fs.statSync(curPath).isDirectory()) {
        clearDir(curPath, true, undefined, log)
        if (log) exConsole.info(`[Delete Dir] ${curPath}`)
      } else {
        fs.unlinkSync(curPath)
        if (log) exConsole.info(`[Delete File] ${curPath}`)
      }
    })

    if (delDir) fs.rmdirSync(pathStr)
  } else if (createDir) {
    mkdirsSync(pathStr)
  } else {
    console.error(`Directory ${delDir} does not exist.`)
  }
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
          stopLoading('ERROR', `${message}: failed.\n ${error}`, errorExit)
        } else {
          exConsole.error(`${message}: failed.`, error, errorExit)
        }
        reject(error)
      } else {
        if (stopLoading) {
          stopLoading('SUCCESS', `${message}: successfully.`)
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

/**
 * 递归创建目录 同步方法
 * @param dirname
 * @returns
 */
export function mkdirsSync(dirname: string) {
  if (fs.existsSync(dirname)) {
    return true
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      try {
        fs.mkdirSync(dirname)
      } catch (error) {
        exConsole.warn(`mkdir ${dirname} failed.`)
      }
      return true
    }
  }
}
