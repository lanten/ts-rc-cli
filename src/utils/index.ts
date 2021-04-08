import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

import { exConsole } from './console'
export * from './console'
export * from './template-parser'

/**
 * 清空文件夹
 *
 * @param {String} pathStr 要清空的文件夹路径
 * @param {Boolean} delDir 清空完成后是否删除文件夹
 * @param {Boolean} createDir 如果不存在,是否创建
 * @param {Boolean} log 是否输出日志
 */
export function clearDir(pathStr?: string, delDir?: boolean, createDir?: boolean, log?: boolean): void {
  if (!pathStr) return exConsole.warn('[clear Dir]: Empty Path!')
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
  }
}

/**
 * 固定字符串长度
 * @param n 要转换的内容
 * @param p 固定长度
 * @param r 补齐字符
 */
export function fixedStringLength(n: number | string, p?: number, r = '0'): string {
  let str = String(n)
  if (p && str.length !== p) {
    if (str.length >= p) {
      str = str.replace(new RegExp(`^(.{${p}})(.*)$`), '$1')
    } else {
      const lost = p - str.length
      if (lost > 0) {
        for (let i = 0; i < lost; i++) {
          str = r + str
        }
      }
    }
  } else {
    str = String(n)
  }

  return str
}

/**
 * 同步执行命令
 * @param paramsSrc
 */
export function syncExec(paramsSrc: { bash: string; msg?: string; inputPath?: string }): string {
  let params = paramsSrc
  if (typeof params === 'string') params = { bash: params }

  const { bash, msg, inputPath } = params

  try {
    const res = execSync(bash, {
      cwd: inputPath,
    }).toString()
    if (msg) exConsole.success(`${msg}: successfully.`)
    return res.toString()
  } catch (ex) {
    if (msg) exConsole.error(`${msg}: failed.\n ${ex}`)
    return ex.toString()
  }
}

// 递归创建目录 同步方法
export function mkdirsSync(dirname: string) {
  if (fs.existsSync(dirname)) {
    return true
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname)
      return true
    }
  }
}
