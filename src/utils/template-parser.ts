export interface TemplateRenderRes {
  fileName?: string
  ignore?: boolean
  content: (string | string[])[]
}

/**
 * 替换模板中的变量
 * @param data
 */
export function replaceTemplate<T = any>(data: string, config: T): string {
  let resStr = data

  resStr = resStr.replace(/<if\s+([^>]+)>(.*?)<\/if>/g, (str: string, $1: string, $2: string) => {
    const $1Arr = $1.split('=')

    const ifKey = $1Arr[0]
    let ifCondition = ($1Arr[1] || '').replace(/\'|\"/g, '') || true
    if (ifCondition == 'false') ifCondition = false
    if (ifCondition == 'true') ifCondition = true

    if (config[ifKey] == ifCondition) {
      return $2.replace(/\\n/, '\n')
    } else {
      return ''
    }
  })

  resStr = resStr.replace(/<var>(.*?)<\/var>/g, (str, $1) => {
    return config[$1]
  })

  return resStr
}

/**
 * 处理函数模板内容
 * @param content
 */
export function handleTemplateRenderContent(content: TemplateRenderRes['content']): string {
  const newArr: string[] = []

  content.forEach((v) => {
    if (v instanceof Array) {
      newArr.push(handleTemplateRenderContent(v))
    } else if (typeof v === 'string') {
      newArr.push(v)
    }
  })

  return newArr.join('\n')
}
