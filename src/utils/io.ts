import fs from 'fs'
import path from 'path'
import { exConsole } from './console'

/**
 * 清空文件夹 (异步)
 *
 * @param {String} pathStr 要清空的文件夹路径
 * @param {Boolean} delDir 清空完成后是否删除文件夹
 * @param {Boolean} createDir 如果不存在,是否创建
 */
export function asyncClearDir(pathStr?: string, delDir?: boolean, createDir?: boolean): Promise<boolean> {
  if (!pathStr) {
    exConsole.warn('[Clear Dir]: Empty Path!')
    return Promise.reject()
  }

  return new Promise(async (resolve, reject) => {
    const fileExists = await isFileExisted(pathStr).catch(reject)

    if (!fileExists) {
      if (createDir) {
        mkdirDeep(pathStr)
        return Promise.reject()
      } else {
        console.error(`Directory ${delDir} does not exist.`)
        return Promise.reject()
      }
    }

    const files = (await asyncReaddirSync(pathStr).catch(reject)) || []

    for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
      const file = files[fileIndex]
      const curPath = path.join(pathStr, file)
      const fileStatus = await asyncStat(curPath).catch(reject)

      if (fileStatus && fileStatus.isDirectory()) {
        await asyncClearDir(curPath, true).catch(reject)
      } else {
        await asyncUnlink(curPath).catch(reject)
      }
    }

    if (delDir) await asyncRmdirSync(pathStr).catch(reject)

    resolve(true)
  })
}

/**
 * 清空文件夹 (同步)
 *
 * @param {String} pathStr 要清空的文件夹路径
 * @param {Boolean} delDir 清空完成后是否删除文件夹
 * @param {Boolean} createDir 如果不存在,是否创建
 * @param {Boolean} log 是否输出日志
 */
export function awaitClearDir(pathStr?: string, delDir?: boolean, createDir?: boolean, log?: boolean): void {
  if (!pathStr) return exConsole.warn('[Clear Dir]: Empty Path!')
  let files = []

  if (fs.existsSync(pathStr)) {
    files = fs.readdirSync(pathStr)
    files.forEach((file) => {
      const curPath = path.join(pathStr, file)

      if (fs.statSync(curPath).isDirectory()) {
        awaitClearDir(curPath, true, undefined, log)
        if (log) exConsole.info(`[Delete Dir] ${curPath}`)
      } else {
        fs.unlinkSync(curPath)
        if (log) exConsole.info(`[Delete File] ${curPath}`)
      }
    })

    if (delDir) fs.rmdirSync(pathStr)
  } else if (createDir) {
    mkdirDeep(pathStr)
  } else {
    console.error(`Directory ${delDir} does not exist.`)
  }
}

/**
 * 递归创建目录 同步方法
 * @param dirname
 * @returns
 */
export function mkdirDeep(dirname: string) {
  if (fs.existsSync(dirname)) {
    return true
  } else {
    if (mkdirDeep(path.dirname(dirname))) {
      try {
        fs.mkdirSync(dirname)
      } catch (error) {
        exConsole.warn(`mkdir ${dirname} failed.`)
      }
      return true
    }
  }
}

export function isFileExisted(filePath: fs.PathLike): Promise<boolean> {
  return new Promise(function (resolve) {
    fs.access(filePath, (err) => {
      if (err) {
        resolve(false)
      } else {
        resolve(true)
      }
    })
  })
}

export function asyncStat(filePath: fs.PathLike): Promise<fs.Stats> {
  return new Promise(function (resolve, reject) {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(err.message)
      } else {
        resolve(stats)
      }
    })
  })
}

export function asyncUnlink(filePath: fs.PathLike) {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        reject(err.message)
      } else {
        resolve(true)
      }
    })
  })
}

export function asyncReaddirSync(dirPath: fs.PathLike): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, (err, files) => {
      if (err) {
        reject(err.message)
      } else {
        resolve(files)
      }
    })
  })
}

export function asyncRmdirSync(dirPath: fs.PathLike) {
  return new Promise((resolve, reject) => {
    fs.rmdir(dirPath, (err) => {
      if (err) {
        reject(err.message)
      } else {
        resolve(true)
      }
    })
  })
}
