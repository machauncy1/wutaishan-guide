#!/usr/bin/env tsx
// 将 guide_availability 旧格式(status/source)迁移为新格式(dayStatus/morning/afternoon)
// 同时保留冗余 status/source 字段用于回滚
// 用法: pnpm tsx scripts/migrate-availability.ts [--dry-run]

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
const dryRun = process.argv.includes('--dry-run');

const COLLECTION = 'guide_availability';
const FREE_PERIOD = { status: 'free' as const };

interface OldRecord {
  _id: string;
  guideId: string;
  date: string;
  status?: string;
  source?: string;
  dayStatus?: string;
}

function migrateRecord(r: OldRecord) {
  // 已经是新格式，跳过
  if (r.dayStatus !== undefined) return null;

  const source = r.source || undefined;
  switch (r.status) {
    case 'leave':
      return {
        dayStatus: 'leave',
        morning: FREE_PERIOD,
        afternoon: FREE_PERIOD,
        // 保留冗余旧字段
        status: 'leave',
        source: null,
      };
    case 'morning':
      return {
        dayStatus: 'free',
        morning: { status: 'dispatched', source },
        afternoon: FREE_PERIOD,
        status: 'morning',
        source: source || null,
      };
    case 'afternoon':
      return {
        dayStatus: 'free',
        morning: FREE_PERIOD,
        afternoon: { status: 'dispatched', source },
        status: 'afternoon',
        source: source || null,
      };
    case 'allday':
      return {
        dayStatus: 'free',
        morning: { status: 'dispatched', source },
        afternoon: { status: 'dispatched', source },
        status: 'allday',
        source: source || null,
      };
    default:
      // free 或未知状态
      return {
        dayStatus: 'free',
        morning: FREE_PERIOD,
        afternoon: FREE_PERIOD,
        status: 'free',
        source: null,
      };
  }
}

async function main() {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}开始迁移 ${COLLECTION}...`);

  // 分批读取所有记录（每批 100 条）
  let offset = 0;
  const batchSize = 100;
  let migrated = 0;
  let skipped = 0;
  let total = 0;

  while (true) {
    const { data: records } = await db.collection(COLLECTION).skip(offset).limit(batchSize).get();

    if (records.length === 0) break;
    total += records.length;

    for (const r of records as OldRecord[]) {
      const update = migrateRecord(r);
      if (!update) {
        skipped++;
        continue;
      }

      if (dryRun) {
        console.log(`  [DRY] ${r._id} (${r.guideId} ${r.date}): ${r.status} → ${update.dayStatus}`);
      } else {
        await db.collection(COLLECTION).doc(r._id).update({ data: update });
      }
      migrated++;
    }

    console.log(`  已处理 ${total} 条...`);
    offset += batchSize;
  }

  console.log(`\n完成！共 ${total} 条记录，迁移 ${migrated} 条，跳过 ${skipped} 条（已是新格式）`);
}

main().catch((err) => {
  console.error('迁移失败:', err);
  process.exit(1);
});
