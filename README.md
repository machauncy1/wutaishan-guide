# 五台山导游小程序

基于微信云开发的五台山当地导游服务小程序。

## 项目结构

```
├── miniprogram/        # 小程序前端
├── cloudfunctions/     # 云函数
│   ├── seedData/       # 数据初始化（导游、全局配置）
│   ├── getGuideList/   # 获取导游列表
│   ├── getGuideDetail/ # 获取导游详情
│   └── getSettings/    # 获取全局配置
├── mcp-server/         # MCP Server（本地开发工具）
│   ├── index.js        # 入口：初始化 CloudBase + MCP
│   └── tools/          # 工具模块（可扩展）
└── .mcp.json           # MCP Server 配置
```

## 环境准备

### 1. 小程序开发

使用微信开发者工具打开项目即可。

### 2. MCP Server（Claude Code 集成）

MCP Server 让 Claude Code 能直接操作云数据库（初始化数据、调用云函数等）。

```bash
# 安装依赖
cd mcp-server && pnpm install

# 在项目根目录创建 .env 文件
TCB_SECRET_ID=你的腾讯云SecretId
TCB_SECRET_KEY=你的腾讯云SecretKey
TCB_ENV_ID=cloud1-7g44gn8c3a08ced5
```

密钥获取：[腾讯云 API 密钥管理](https://console.cloud.tencent.com/cam/capi)

配置完成后重启 Claude 插件（`Cmd+Shift+P` → `Claude: Restart`），即可通过自然语言操作云数据。

### 3. 云函数部署（可选）

安装云开发 CLI 后可通过命令行部署云函数：

```bash
pnpm add -g @cloudbase/cli
tcb login --apiKeyId <SecretId> --apiKey <SecretKey>
cd cloudfunctions/seedData && tcb fn deploy seedData --envId cloud1-7g44gn8c3a08ced5 --force --yes
```

也可在微信开发者工具中右键云函数目录 → 上传并部署。
