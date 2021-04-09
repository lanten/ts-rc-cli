# ts-rc-cli
![v](https://img.shields.io/npm/v/ts-rc-cli)
![dm](https://img.shields.io/npm/dm/ts-rc-cli)
![languages](https://img.shields.io/github/languages/top/lanten/ts-rc-cli)
![last-commit](https://img.shields.io/github/last-commit/lanten/ts-rc-cli)


### 创建模板项目

```bash
npm i -g ts-rc-cli

# >>

ts-rc create
```

### 指令

`ts-rc` 命令, 例子: `ts-rc dev`

| 指令   | 说明         | 参数   |
| ------ | ------------ | ------ |
| create | 创建模板项目 | ...env |
| dev    | 启动本地服务 | ...env |
| build  | 执行编译脚本 | ...env |




### 配置

创建 `config/index.ts` 文件

chestnut:
```ts
import path from 'path'
import { ReactTsConfigPartial } from 'ts-rc-cli'

const rootPath = process.cwd()

const projectName = 'new-project'
const projectTitle = 'New Project'

const config: ReactTsConfigPartial = {
  projectName,
  projectTitle,
  port: 18081,
  htmlOptions: {
    template: path.resolve(rootPath, 'src/index.html'),
  },
  devServerOptions: {
    publicPath: '',
  },

  entry: {
    app: path.resolve(rootPath, 'src/index.tsx'),
  },
}

export default config

```

#### ⚠ 注意: `config` 使用的 `tsconfig` 是独立的, 如下所示
```json
[
  "-m commonjs",
  "-t es6",
  "--moduleResolution node",
  "--resolveJsonModule true",
  "--esModuleInterop true",
  "--allowSyntheticDefaultImports true",
  "--suppressImplicitAnyIndexErrors true",
  "--skipLibCheck true",
  "--types node",
  "--lib esnext,scripthost,es5",
  "--outDir ${outPath}",
]
```


项目根目录需要添加 `tsconfig.json` 文件.

此外,请按需添加 `.eslintignore`, `.eslintrc.js`, `.browserslistrc` 文件.

### 使用

启动 dev-server:
```
ts-rc dev
```

编译:
```
ts-rc build
```

脚本将自动读取 `config` 下的配置文件


整合了 `cross-env`, 可以直接添加环境变量:
```
ts-rc-dev MY_ENV=xxx
ts-rc-build MY_ENV=xxx
```


## 默认配置

在 [config.d.ts](./types/config.d.ts) 中查看全部默认配置

- 在生产环境中默认移除了 `console.log`, 可以在 `terserOptions` 中修改
- `@` 是 `src` 的别名
- 默认 `dev-server` 端口号: `18080`
- 默认入口文件: `src/main.ts`
- 默认构建环境: `mock` | `dev` | `prod`



## 环境变量
| 变量名      | 说明         | 类型                       | 默认值          |
| ----------- | ------------ | -------------------------- | --------------- |
| CONFIG_PATH | 配置文件路径 | string                     | config/index.ts |
| NODE_ENV    | Node 参数    | development/production     | auto            |
| BUILD_ENV   | 构建参数     | keyOf ReactTsConfig['env'] | dev             |



---

## 源代码相关

#### 子模块
- [react-ts-template](https://github.com/lanten/react-ts-template)

#### 初始化子模块
```bash
git submodule init
```

#### 拉取子模块
```bash
git submodule update
```