#!/usr/bin/env tsx
// 初始化预置数据（导游、全局配置、用户账号）
// 用法: pnpm seed / pnpm seed:force

import tcb from '@cloudbase/node-sdk';
import { config } from 'dotenv';
import { resolve } from 'path';

import guidesJson from './data/guides.json';
import settingsJson from './data/settings.json';
import usersJson from './data/users.json';

const guides = guidesJson as Guide[];
const defaultSettings = settingsJson as Settings;
const adminUsers = usersJson as Pick<User, 'phone' | 'name' | 'role'>[];

config({ path: resolve(__dirname, '..', '.env') });

const { TCB_SECRET_ID, TCB_SECRET_KEY, TCB_ENV_ID } = process.env;
if (!TCB_SECRET_ID || !TCB_SECRET_KEY || !TCB_ENV_ID) {
  console.error('缺少环境变量，请检查 .env 文件');
  process.exit(1);
}

const app = tcb.init({ secretId: TCB_SECRET_ID, secretKey: TCB_SECRET_KEY, env: TCB_ENV_ID });
const db = app.database();
const force = process.argv.includes('--force');

async function ensureCollection(name: string): Promise<void> {
  try {
    await db.collection(name).count();
    console.log(`${name}：集合已存在`);
  } catch (_e) {
    await db.createCollection(name);
    console.log(`${name}：集合已创建`);
  }
}

async function seedGuides(now: number): Promise<void> {
  const { total } = await db.collection('guides').count();

  if (total > 0 && !force) {
    console.log(`guides：已有 ${total} 条数据，跳过（--force 可强制重置）`);
    return;
  }

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

async function seedSettings(now: number): Promise<void> {
  let settingsExists = false;
  try {
    await db.collection('settings').doc('global').get();
    settingsExists = true;
  } catch (_e) {
    settingsExists = false;
  }

  if (settingsExists && !force) {
    console.log('settings：已存在，跳过');
    return;
  }

  const { _id, ...data } = defaultSettings;
  if (settingsExists) {
    await db
      .collection('settings')
      .doc('global')
      .update({ ...data, updatedAt: now });
    console.log('settings：已更新');
  } else {
    await db.collection('settings').add({ _id: 'global', ...data, createdAt: now, updatedAt: now });
    console.log('settings：已创建');
  }
}

async function seedUsers(now: number): Promise<void> {
  const { total } = await db.collection('users').count();

  if (total > 0 && !force) {
    console.log(`users：已有 ${total} 条数据，跳过`);
    return;
  }

  // force 模式下清空
  if (total > 0) {
    let deleted = 0;
    while (true) {
      const res = await db
        .collection('users')
        .where({ createdAt: db.command.gte(0) })
        .remove();
      deleted += res.deleted;
      if (res.deleted === 0) break;
    }
    console.log(`users：已删除 ${deleted} 条`);
  }

  // 1. 为每个导游创建 guide 角色账号
  const { data: allGuides } = await db
    .collection('guides')
    .field({ _id: true, name: true, phone: true })
    .limit(100)
    .get();

  let guideCount = 0;
  for (const g of allGuides) {
    await db.collection('users').add({
      phone: g.phone,
      name: g.name,
      role: 'guide',
      guideId: g._id,
      createdAt: now,
    });
    guideCount++;
  }
  console.log(`users：已为 ${guideCount} 位导游创建账号`);

  // 2. 创建管理员账号
  for (const admin of adminUsers) {
    await db.collection('users').add({
      ...admin,
      createdAt: now,
    });
  }
  console.log(`users：已创建 ${adminUsers.length} 个管理员账号`);
}

async function seed(): Promise<void> {
  const now = Date.now();

  await seedGuides(now);
  await seedSettings(now);
  await ensureCollection('bookings');
  await ensureCollection('users');
  await ensureCollection('guide_availability');
  await ensureCollection('sessions');
  await seedUsers(now);

  console.log('Done.');
}

seed().catch((e: Error) => {
  console.error(e);
  process.exit(1);
});
