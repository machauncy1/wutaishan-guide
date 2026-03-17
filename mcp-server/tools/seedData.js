import { z } from 'zod';

export function register(server, app) {
  server.tool(
    'seed-data',
    '初始化预置数据（导游、全局配置），force=true 时强制重置',
    { force: z.boolean().optional().describe('是否强制重置已有数据') },
    async ({ force = false }) => {
      const result = await app.callFunction({
        name: 'seedData',
        data: { force },
      });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result.result, null, 2),
          },
        ],
      };
    }
  );
}
