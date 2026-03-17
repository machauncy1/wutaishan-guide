# 五台山导游小程序

基于微信云开发的五台山当地导游服务小程序。

## 技术栈

- 微信小程序 + TypeScript
- 微信云开发（CloudBase）客户端直查
- ESLint + Prettier + husky pre-commit

## 项目结构

```
├── miniprogram/           # 小程序前端（TypeScript）
│   ├── services/          # 数据服务层（wx.cloud.database 直查）
│   ├── pages/             # 页面（导游列表、导游详情）
│   ├── components/        # 组件（导游卡片、底部联系栏）
│   └── tsconfig.json      # 小程序 TS 配置
├── scripts/               # 工具脚本
│   ├── seed.ts            # 数据库初始化脚本
│   └── data/              # 预置数据（guides.json、settings.json）
├── types/                 # 共享类型定义（数据库 schema）
│   └── index.d.ts
├── cloudfunctions/        # 云函数（预留，当前未使用）
├── tsconfig.json          # Node 脚本 TS 配置
├── eslint.config.mjs      # ESLint 配置（JS + TS）
└── package.json           # 依赖管理 + 脚本命令
```

## 环境准备

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

在项目根目录创建 `.env` 文件：

```
TCB_SECRET_ID=你的腾讯云SecretId
TCB_SECRET_KEY=你的腾讯云SecretKey
TCB_ENV_ID=cloud1-7g44gn8c3a08ced5
```

密钥获取：[腾讯云 API 密钥管理](https://console.cloud.tencent.com/cam/capi)

### 3. 初始化数据库

```bash
pnpm seed          # 增量（已有数据则跳过）
pnpm seed:force    # 强制重置全部数据
```

### 4. 小程序开发

使用微信开发者工具打开项目即可，TS 编译已启用。

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm seed` | 初始化数据库（增量） |
| `pnpm seed:force` | 强制重置数据库 |
| `pnpm lint` | 代码检查 |
| `pnpm lint:fix` | 自动修复 |

## 数据管理

导游和配置数据存放在 `scripts/data/` 目录下的 JSON 文件中。修改数据后运行 `pnpm seed:force` 即可同步到云数据库。

类型定义在 `types/index.d.ts`，同时作为数据库 schema 文档。
