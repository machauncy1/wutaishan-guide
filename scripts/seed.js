#!/usr/bin/env node
// 初始化预置数据（导游、全局配置）
// 用法: node scripts/seed.js [--force]

const tcb = require('@cloudbase/node-sdk');
const { config } = require('dotenv');
const { resolve } = require('path');

config({ path: resolve(__dirname, '..', '.env') });

const { TCB_SECRET_ID, TCB_SECRET_KEY, TCB_ENV_ID } = process.env;
if (!TCB_SECRET_ID || !TCB_SECRET_KEY || !TCB_ENV_ID) {
  console.error('缺少环境变量，请检查 .env 文件');
  process.exit(1);
}

const app = tcb.init({ secretId: TCB_SECRET_ID, secretKey: TCB_SECRET_KEY, env: TCB_ENV_ID });
const db = app.database();
const force = process.argv.includes('--force');

const guides = require('./data/guides.json');
const defaultSettings = require('./data/settings.json');

async function seed() {
  const now = Date.now();

  // ===== 1. guides =====
  const { total } = await db.collection('guides').count();

  if (total > 0 && !force) {
    console.log(`guides：已有 ${total} 条数据，跳过（--force 可强制重置）`);
  } else {
    if (total > 0) {
      let deleted = 0;
      while (true) {
        const res = await db
          .collection('guides')
          .where({ sort: db.command.gte(0) })
          .remove();
        deleted += res.deleted;
        if (res.deleted === 0) break;
      }
      console.log(`guides：已删除 ${deleted} 条`);
    }
    for (const guide of guides) {
      await db.collection('guides').add({ ...guide, createdAt: now, updatedAt: now });
    }
    console.log(`guides：已插入 ${guides.length} 条`);
  }

  // ===== 2. settings =====
  let settingsExists = false;
  try {
    await db.collection('settings').doc('global').get();
    settingsExists = true;
  } catch (e) {
    settingsExists = false;
  }

  if (settingsExists && !force) {
    console.log('settings：已存在，跳过');
  } else {
    const { _id, ...data } = defaultSettings;
    if (settingsExists) {
      await db
        .collection('settings')
        .doc('global')
        .update({ ...data, updatedAt: now });
      console.log('settings：已更新');
    } else {
      await db
        .collection('settings')
        .add({ _id: 'global', ...data, createdAt: now, updatedAt: now });
      console.log('settings：已创建');
    }
  }

  console.log('Done.');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
