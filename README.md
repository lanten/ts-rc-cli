# react-ts-cli


### 命令行工具

| 命令           | 说明         | 参数   |
| -------------- | ------------ | ------ |
| react-ts-dev   | 启动本地服务 | ...env |
| react-ts-build | 执行编译脚本 | ...env |


### 配置

创建 `config/index.ts` 文件

chestnut:
```ts
import path from 'path'
import { ReactTsConfigPartial } from '@sbc-fe/react-ts-cli'

const rootPath = process.cwd()

const projectName = 'new-project'
const projectTitle = 'New Project'

const config: ReactTsConfigPartial = {
  projectName,
  projectTitle,
  port: 18081,
  htmlTemplate: path.resolve(rootPath, 'src/index.html'),
  devPublicPath: '',

  entry: {
    app: path.resolve(rootPath, 'src/index.tsx'),
  },
}

export default config

```

创建 `config/tsconfig.json` 文件

chestnut:
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "es6",
    "sourceMap": false,
    "strict": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "suppressImplicitAnyIndexErrors": true,
    "types": [
      "node"
    ],
    "lib": [
      "esnext",
      "scripthost",
      "es5"
    ]
  },
  "exclude": [
    "node_modules",
  ]
}
```

项目根目录需要添加 `tsconfig.json` 文件.

此外,请按需添加 `.eslintignore`, `.eslintrc.js`, `.browserslistrc` 文件.

### 使用

启动 dev-server:
```
react-ts-dev
```

编译:
```
react-ts-build
```

脚本将自动读取 `config` 下的配置文件


整合了 `cross-env`, 可以直接添加环境变量:
```
react-ts-dev MY_ENV=xxx
react-ts-build MY_ENV=xxx
```

## 默认配置

在 [config.d.ts](./types/config.d.ts) 中查看全部默认配置

- 在生产环境中默认移除了 `console.log`, 可以在 `terserOptions` 中修改
- `@` 是 `src` 的别名
- 默认入口文件: `src/main.ts`
- 默认环境区分: `mock` | `dev` | `prod`


---

## 初始化子模块
```bash
git submodule init
```