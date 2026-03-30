#!/usr/bin/env tsx
// 清除 guide_availability 中的冗余旧字段 status/source
// 前提：数据已迁移为新格式（dayStatus/morning/afternoon）
// 用法: pnpm tsx scripts/cleanup-legacy-fields.ts [--dry-run]

import tcb from '@cloudbase/node-sdk';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '..', '.env') });

const { TCB_SECRET_ID, TCB_SECRET_KEY, TCB_ENV_ID } = process.env;
if (!TCB_SECRET_ID || !TCB_SECRET_KEY || !TCB_ENV_ID) {
  console.error('缺少环境变量，请检查 .env 文件');
  process.exit(1);
}

const app = tcb.init({ secretId: TCB_SECRET_ID, secretKey: TCB_SECRET_KEY, env: TCB_ENV_ID });
const db = app.database();
const _ = db.command;
const dryRun = process.argv.includes('--dry-run');

const COLLECTION = 'guide_availability';

async function main() {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}清除 ${COLLECTION} 中的冗余字段 status/source...`);

  let offset = 0;
  const batchSize = 100;
  let cleaned = 0;
  let skipped = 0;
  let total = 0;

  while (true) {
    const { data: records } = await db.collection(COLLECTION).skip(offset).limit(batchSize).get();
    if (records.length === 0) break;
    total += records.length;

    for (const r of records as any[]) {
      // 只处理还有旧字段的记录
      if (r.status === undefined && r.source === undefined) {
        skipped++;
        continue;
      }

      if (dryRun) {
        console.log(`  [DRY] ${r._id}: 删除 status=${r.status}, source=${r.source}`);
      } else {
        await db
          .collection(COLLECTION)
          .doc(r._id)
          .update({
            data: {
              status: _.remove(),
              source: _.remove(),
            },
          });
      }
      cleaned++;
    }

    console.log(`  已处理 ${total} 条...`);
    offset += batchSize;
  }

  console.log(`\n完成！共 ${total} 条记录，清除 ${cleaned} 条，跳过 ${skipped} 条（无旧字段）`);
}

main().catch((err) => {
  console.error('清理失败:', err);
  process.exit(1);
});
