import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import tcb from '@cloudbase/node-sdk';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// 加载项目根目录的 .env
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env') });

const { TCB_SECRET_ID, TCB_SECRET_KEY, TCB_ENV_ID } = process.env;

if (!TCB_SECRET_ID || !TCB_SECRET_KEY || !TCB_ENV_ID) {
  console.error('缺少环境变量：TCB_SECRET_ID / TCB_SECRET_KEY / TCB_ENV_ID');
  process.exit(1);
}

// 初始化云开发
const app = tcb.init({
  secretId: TCB_SECRET_ID,
  secretKey: TCB_SECRET_KEY,
  env: TCB_ENV_ID,
});

// 创建 MCP Server
const server = new McpServer({
  name: 'wutaishan-cloud',
  version: '1.0.0',
});

// 注册工具模块
const modules = await Promise.all([
  import('./tools/seedData.js'),
]);
for (const mod of modules) {
  mod.register(server, app);
}

// 启动
const transport = new StdioServerTransport();
await server.connect(transport);
