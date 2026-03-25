#!/usr/bin/env tsx
// 本地 API 开发服务器：直连云数据库，模拟 availabilityApi 云函数
// 用法: pnpm dev:api

import { createServer, IncomingMessage, ServerResponse } from 'http';
import tcb from '@cloudbase/node-sdk';
import { config } from 'dotenv';
import { resolve } from 'path';
import crypto from 'crypto';

config({ path: resolve(__dirname, '..', '.env') });

const { TCB_SECRET_ID, TCB_SECRET_KEY, TCB_ENV_ID } = process.env;
if (!TCB_SECRET_ID || !TCB_SECRET_KEY || !TCB_ENV_ID) {
  console.error('缺少环境变量，请检查 .env 文件');
  process.exit(1);
}

const app = tcb.init({ secretId: TCB_SECRET_ID, secretKey: TCB_SECRET_KEY, env: TCB_ENV_ID });
const db = app.database();
const _ = db.command;

const SESSION_TTL_MS = 90 * 24 * 60 * 60 * 1000;
const VALID_STATUSES = ['available', 'unavailable', 'assigned'];
const GUIDE_ALLOWED_STATUSES = ['available', 'unavailable'];

function json(res: ServerResponse, code: number, data: unknown) {
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  });
  res.end(JSON.stringify(data));
}

function readBody(req: IncomingMessage): Promise<Record<string, any>> {
  return new Promise((resolve) => {
    let s = '';
    req.on('data', (c: Buffer) => (s += c));
    req.on('end', () => {
      try {
        resolve(s ? JSON.parse(s) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function query(url: string): Record<string, string> {
  const i = url.indexOf('?');
  if (i === -1) return {};
  const r: Record<string, string> = {};
  new URLSearchParams(url.slice(i + 1)).forEach((v, k) => (r[k] = v));
  return r;
}

function token(req: IncomingMessage): string {
  const a = req.headers.authorization || '';
  return a.startsWith('Bearer ') ? a.slice(7) : '';
}

function dateRange(days: number): string[] {
  const r: string[] = [];
  const now = new Date();
  const bj = 8 * 60 * 60 * 1000;
  for (let i = 0; i < days; i++) {
    r.push(new Date(now.getTime() + bj + i * 86400000).toISOString().slice(0, 10));
  }
  return r;
}

async function auth(t: string) {
  if (!t) return null;
  try {
    const sRes = await db.collection('sessions').doc(t).get();
    const s = Array.isArray(sRes.data) ? sRes.data[0] : sRes.data;
    if (!s || s.isRevoked || s.expireAt < Date.now()) return null;
    const uRes = await db.collection('users').doc(s.userId).get();
    const u = Array.isArray(uRes.data) ? uRes.data[0] : uRes.data;
    return u || null;
  } catch {
    return null;
  }
}

const server = createServer(async (req, res) => {
  const method = req.method || '';
  const url = req.url || '';
  const path = url.split('?')[0].replace(/^\/api/, '');

  if (method === 'OPTIONS') {
    json(res, 204, '');
    return;
  }

  try {
    // Login
    if (method === 'POST' && path === '/login') {
      const { phone } = await readBody(req);
      if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
        json(res, 400, { success: false, errMsg: '请输入正确的手机号' });
        return;
      }
      const { data } = await db.collection('users').where({ phone }).limit(1).get();
      if (!data[0]) {
        json(res, 400, { success: false, errMsg: '该手机号未注册' });
        return;
      }
      const user = data[0];
      const tk = crypto.randomUUID();
      await db
        .collection('sessions')
        .doc(tk)
        .set({
          userId: user._id,
          role: user.role,
          expireAt: Date.now() + SESSION_TTL_MS,
          isRevoked: false,
        });
      json(res, 200, { success: true, data: { token: tk, role: user.role, name: user.name } });
      return;
    }

    // Auth required
    const user = await auth(token(req));
    if (!user) {
      json(res, 401, { success: false, errMsg: '未登录或登录已过期' });
      return;
    }

    // GET /me
    if (method === 'GET' && path === '/me') {
      json(res, 200, {
        success: true,
        data: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          guideId: user.guideId || null,
        },
      });
      return;
    }

    // GET /my-availability
    if (method === 'GET' && path === '/my-availability') {
      if (user.role !== 'guide') {
        json(res, 400, { success: false, errMsg: '仅导游可访问' });
        return;
      }
      const dates = dateRange(7);
      const { data: records } = await db
        .collection('guide_availability')
        .where({ guideId: user.guideId, date: _.gte(dates[0]).and(_.lte(dates[6])) })
        .get();
      const m: Record<string, string> = {};
      for (const r of records) m[r.date] = r.status;
      json(res, 200, {
        success: true,
        data: dates.map((d) => ({ date: d, status: m[d] || 'available' })),
      });
      return;
    }

    // POST /set-availability
    if (method === 'POST' && path === '/set-availability') {
      if (user.role !== 'guide') {
        json(res, 400, { success: false, errMsg: '仅导游可操作' });
        return;
      }
      const { date, status } = await readBody(req);
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        json(res, 400, { success: false, errMsg: '无效日期' });
        return;
      }
      if (!GUIDE_ALLOWED_STATUSES.includes(status)) {
        json(res, 400, { success: false, errMsg: '导游只能设为可接或不可接' });
        return;
      }
      const { data: ex } = await db
        .collection('guide_availability')
        .where({ guideId: user.guideId, date })
        .limit(1)
        .get();
      const now = Date.now();
      if (ex.length > 0)
        await db
          .collection('guide_availability')
          .doc(ex[0]._id)
          .update({ status, updatedBy: user._id, updatedAt: now });
      else
        await db
          .collection('guide_availability')
          .add({ guideId: user.guideId, date, status, updatedBy: user._id, updatedAt: now });
      json(res, 200, { success: true });
      return;
    }

    // GET /daily-guides
    if (method === 'GET' && path === '/daily-guides') {
      if (user.role !== 'admin') {
        json(res, 400, { success: false, errMsg: '仅管理员可访问' });
        return;
      }
      const { date } = query(url);
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        json(res, 400, { success: false, errMsg: '无效日期' });
        return;
      }
      const { data: guides } = await db
        .collection('users')
        .where({ role: 'guide' })
        .field({ _id: true, name: true, guideId: true, phone: true })
        .limit(100)
        .get();
      const { data: records } = await db.collection('guide_availability').where({ date }).get();
      const m: Record<string, string> = {};
      for (const r of records) m[r.guideId] = r.status;
      json(res, 200, {
        success: true,
        data: guides.map((u: any) => ({
          userId: u._id,
          guideId: u.guideId,
          name: u.name,
          phone: u.phone,
          status: m[u.guideId] || 'available',
        })),
      });
      return;
    }

    // POST /update-status
    if (method === 'POST' && path === '/update-status') {
      if (user.role !== 'admin') {
        json(res, 400, { success: false, errMsg: '仅管理员可操作' });
        return;
      }
      const { guideId, date, status } = await readBody(req);
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        json(res, 400, { success: false, errMsg: '无效日期' });
        return;
      }
      if (!VALID_STATUSES.includes(status)) {
        json(res, 400, { success: false, errMsg: '无效状态' });
        return;
      }
      const { data: ex } = await db
        .collection('guide_availability')
        .where({ guideId, date })
        .limit(1)
        .get();
      const now = Date.now();
      if (ex.length > 0)
        await db
          .collection('guide_availability')
          .doc(ex[0]._id)
          .update({ status, updatedBy: user._id, updatedAt: now });
      else
        await db
          .collection('guide_availability')
          .add({ guideId, date, status, updatedBy: user._id, updatedAt: now });
      json(res, 200, { success: true });
      return;
    }

    json(res, 404, { success: false, errMsg: '接口不存在' });
  } catch (e) {
    console.error('error:', e);
    json(res, 500, { success: false, errMsg: '服务器内部错误' });
  }
});

server.listen(3000, () => {
  console.log('API running at http://localhost:3000');
  console.log(
    'Routes: POST /api/login, GET /api/me, GET /api/my-availability, POST /api/set-availability, GET /api/daily-guides?date=, POST /api/update-status',
  );
});
