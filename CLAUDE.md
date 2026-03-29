# Project: Wutaishan Guide (五台山导游平台)

## Overview
五台山导游预约平台，包含微信小程序(游客端)、H5 Web 管理端(导游/管理员)、腾讯云开发云函数(后端)。
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
pnpm web:deploy           # 构建并部署到 Cloudflare Pages
```

## Architecture
- **miniprogram/**: 微信小程序 (TypeScript, WeChat API)，游客浏览导游、预约
- **web/**: H5 管理端 (React 19 + React Router 7 + Vite + Tailwind CSS)，导游管理排班
- **cloudfunctions/**: 腾讯云开发云函数 (JavaScript, wx-server-sdk)
  - `availabilityApi`: 导游排班管理 (JWT 认证, Repository + Service 分层)
  - `createBooking`: 预约创建 + 邮件通知
- **scripts/**: 数据库初始化与本地开发工具 (TypeScript, tsx 执行)
- **types/**: 跨端共享类型定义

## Tech Stack
- Node 24 (.nvmrc) / pnpm 10.33
- TypeScript 5.9 (strict mode via tsconfig.base.json)
- 小程序: ES2017 + CommonJS
- Web: React 19 + ES2020 + ESNext modules + Vite 6
- 云函数: JavaScript + wx-server-sdk
- 后端: 腾讯云开发 CloudBase (envId: cloud1-7g44gn8c3a08ced5)

## Workflow
- 使用 nvm 管理 Node 版本，执行命令前需先: `unset -f node pnpm npx 2>/dev/null; export PATH="/Users/chauncy/.nvm/versions/node/v24.14.0/bin:$PATH"`
- 代码变更完成后，必须运行 `pnpm lint:fix` 确保通过 lint 检查

## Conventions
- 使用中文编写注释和用户面向的文案
- Prettier: 单引号, 尾逗号, 2 空格缩进, 分号, 100 字符行宽
- ESLint flat config (eslint.config.mjs)
- 提交前自动 lint-staged (husky)
- Web 端 API 请求统一通过 web/src/api/client.ts
- 云函数遵循 Repository + Handler + Service 分层模式
- 共享类型定义在 types/index.d.ts，修改后需确保三端兼容

## Important Notes
- .env 包含腾讯云密钥，绝不提交敏感信息到仓库
- 小程序 AppID: wx2629c66b5a4dd55d
- 小程序使用 miniprogram_npm，cloudfunctions/ 不参与 ESLint
- Web 开发时 Vite 代理 /api 到 localhost:3000
