# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

五台山导游预约平台 — 微信小程序(游客端)、H5 Web 管理端(导游/管理员)、腾讯云开发云函数(后端)。
Monorepo 架构，pnpm workspace 管理。

## Commands

```bash
pnpm install              # 安装依赖
pnpm lint                 # ESLint 检查
pnpm lint:fix             # ESLint 自动修复
pnpm seed                 # 初始化数据库（增量）
pnpm seed:force           # 强制重置数据库
pnpm dev:api              # 本地 API 服务器 (localhost:3000)
pnpm web:dev              # Vite 开发服务器 (localhost:5173)
pnpm web:build            # 生产构建
pnpm web:deploy           # 构建并部署到 Cloudflare Pages (项目: ncts-dispatch)
```

## Architecture

```
miniprogram/       微信小程序 — 游客浏览导游、预约（直连 CloudBase 数据库）
web/               H5 管理端 — React 19 + React Router 7 + Vite 6 + Tailwind CSS
cloudfunctions/    腾讯云开发云函数 (JavaScript, wx-server-sdk)
  availabilityApi  导游排班 API (Session 认证, Repository + Handler + Service 分层)
  createBooking    预约创建 + 邮件通知
scripts/           数据库初始化 (seed.ts) 与本地 API 开发服务器 (dev-server.ts)
types/             跨端共享类型定义 (types/index.d.ts)
```

### Data Access Model

小程序直接通过 `wx.cloud.database()` 查询 CloudBase，无 API 层。
H5 管理端通过 `availabilityApi` 云函数走 HTTP API，经 Session 认证后操作排班数据。
两个端共享同一 CloudBase 数据库，但访问路径不同。

### Web 端数据流

```
页面组件 → TanStack Query hooks (web/src/hooks/) → 服务层 (web/src/services/) → API client (web/src/api/client.ts) → /api → availabilityApi 云函数
```

- TanStack Query v5 + localStorage 持久化 (24 小时 TTL)
- API client 自动附加 Bearer token，401 时清除登录态并跳转 /login
- 路由守卫 RequireAuth 检查 localStorage 中的 role，服务端二次校验 token

### 云函数认证

非 JWT — 使用 UUID token 存储在 sessions 集合，带过期时间和撤销标志。
Token 有效期 90 天，通过 `authService.js` 的 `validateSession()` 校验。

## Tech Stack

- Node 24 (.nvmrc) / pnpm 10.33
- TypeScript 5.9 (strict mode, 三套 tsconfig: Node/Web/小程序)
- Web: React 19 + ES2020 + ESNext modules + Vite 6
- 小程序: ES2017 + CommonJS
- 云函数: JavaScript + wx-server-sdk
- 后端: 腾讯云开发 CloudBase (envId: cloud1-7g44gn8c3a08ced5)

## Workflow

- 使用 nvm 管理 Node 版本，执行命令前需先: `unset -f node pnpm npx 2>/dev/null; export PATH="/Users/chauncy/.nvm/versions/node/v24.14.0/bin:$PATH"`
- 代码变更完成后，必须运行 `pnpm lint:fix` 确保通过 lint 检查
- Web 开发时 Vite 代理 /api 到 localhost:3000，需同时运行 `pnpm dev:api`

## Conventions

- 使用中文编写注释和用户面向的文案
- Prettier: 单引号, 尾逗号, 2 空格缩进, 分号, 100 字符行宽
- ESLint flat config (eslint.config.mjs)，cloudfunctions/ 不参与 ESLint
- 提交前自动 lint-staged (husky)
- 共享类型定义在 types/index.d.ts，修改后需确保三端兼容
- 各端详细规范见 `.claude/rules/` 下的对应文件

## Important Notes

- .env 包含腾讯云密钥 (TCB_SECRET_ID, TCB_SECRET_KEY, TCB_ENV_ID)，绝不提交
- 小程序 AppID: wx2629c66b5a4dd55d，使用 miniprogram_npm
- 部署 Web 端使用 `pnpm web:deploy`，会自动复制 index.html → 404.html 作为 SPA fallback
- 云函数每个独立目录有自己的 package.json 和 node_modules，互不影响
