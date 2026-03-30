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
const VALID_DAY_STATUSES = ['free', 'leave'];
const VALID_PERIOD_STATUSES = ['free', 'dispatched'];
const MAX_SOURCE_LEN = 20;

const FREE_PERIOD = { status: 'free' };

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
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    r.push(d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' }));
  }
  return r;
}

/** 校验时段 */
function validatePeriod(period: any): string | null {
  if (!period) return null;
  if (!VALID_PERIOD_STATUSES.includes(period.status)) return '无效时段状态';
  if (period.status === 'dispatched') {
    const src = typeof period.source === 'string' ? period.source.trim() : '';
    if (!src) return '请选择派单平台';
    if (src.length > MAX_SOURCE_LEN) return `平台名称不超过${MAX_SOURCE_LEN}字`;
  }
  return null;
}

function normalizePeriod(period: any) {
  if (!period) return undefined;
  if (period.status === 'free') return { status: 'free' };
  return { status: 'dispatched', source: period.source.trim() };
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

async function upsertAvailability(guideId: string, date: string, fields: any, updatedBy: string) {
  const now = Date.now();
  const record = { ...fields, updatedBy, updatedAt: now };
  const { data: ex } = await db
    .collection('guide_availability')
    .where({ guideId, date })
    .limit(1)
    .get();
  if (ex.length > 0) {
    await db.collection('guide_availability').doc(ex[0]._id).update({ data: record });
  } else {
    await db.collection('guide_availability').add({ guideId, date, ...record });
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
      const { phone, password } = await readBody(req);
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
      const expected = user.password || phone.slice(-4);
      if (password !== expected) {
        json(res, 400, { success: false, errMsg: '密码错误' });
        return;
      }
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

    // Reset password (no auth)
    if (method === 'POST' && path === '/reset-password') {
      const { phone, oldPassword, newPassword } = await readBody(req);
      if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
        json(res, 400, { success: false, errMsg: '请输入正确的手机号' });
        return;
      }
      if (!newPassword || (newPassword as string).length < 4) {
        json(res, 400, { success: false, errMsg: '新密码至少4位' });
        return;
      }
      const { data } = await db.collection('users').where({ phone }).limit(1).get();
      if (!data[0]) {
        json(res, 400, { success: false, errMsg: '该手机号未注册' });
        return;
      }
      const u = data[0];
      const expected = u.password || phone.slice(-4);
      if (oldPassword !== expected) {
        json(res, 400, { success: false, errMsg: '原密码错误' });
        return;
      }
      await db.collection('users').doc(u._id).update({ password: newPassword });
      json(res, 200, { success: true });
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
      const dates = dateRange(30);
      const { data: records } = await db
        .collection('guide_availability')
        .where({ guideId: user.guideId, date: _.gte(dates[0]).and(_.lte(dates[dates.length - 1])) })
        .get();
      const recordMap: Record<string, any> = {};
      for (const r of records) recordMap[r.date] = r;
      json(res, 200, {
        success: true,
        data: dates.map((d) => {
          const r = recordMap[d];
          return {
            date: d,
            dayStatus: r?.dayStatus || 'free',
            morning: r?.morning || FREE_PERIOD,
            afternoon: r?.afternoon || FREE_PERIOD,
          };
        }),
      });
      return;
    }

    // POST /set-availability
    if (method === 'POST' && path === '/set-availability') {
      if (user.role !== 'guide') {
        json(res, 400, { success: false, errMsg: '仅导游可操作' });
        return;
      }
      const body = await readBody(req);
      const { date, dayStatus, morning, afternoon } = body;
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        json(res, 400, { success: false, errMsg: '无效日期' });
        return;
      }
      if (dayStatus !== undefined && !VALID_DAY_STATUSES.includes(dayStatus)) {
        json(res, 400, { success: false, errMsg: '无效日状态' });
        return;
      }
      for (const [label, period] of [
        ['上午', morning],
        ['下午', afternoon],
      ] as const) {
        const err = validatePeriod(period);
        if (err) {
          json(res, 400, { success: false, errMsg: `${label}: ${err}` });
          return;
        }
      }

      const finalDayStatus = dayStatus || 'free';
      const finalMorning =
        finalDayStatus === 'leave' ? FREE_PERIOD : normalizePeriod(morning) || FREE_PERIOD;
      const finalAfternoon =
        finalDayStatus === 'leave' ? FREE_PERIOD : normalizePeriod(afternoon) || FREE_PERIOD;

      await upsertAvailability(
        user.guideId,
        date,
        { dayStatus: finalDayStatus, morning: finalMorning, afternoon: finalAfternoon },
        user._id,
      );
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
      const recordMap: Record<string, any> = {};
      for (const r of records) recordMap[r.guideId] = r;
      json(res, 200, {
        success: true,
        data: guides.map((u: any) => {
          const r = recordMap[u.guideId];
          return {
            userId: u._id,
            guideId: u.guideId,
            name: u.name,
            phone: u.phone,
            dayStatus: r?.dayStatus || 'free',
            morning: r?.morning || FREE_PERIOD,
            afternoon: r?.afternoon || FREE_PERIOD,
          };
        }),
      });
      return;
    }

    // POST /update-status
    if (method === 'POST' && path === '/update-status') {
      if (user.role !== 'admin') {
        json(res, 400, { success: false, errMsg: '仅管理员可操作' });
        return;
      }
      const body = await readBody(req);
      const { guideId, date, dayStatus, morning, afternoon } = body;
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        json(res, 400, { success: false, errMsg: '无效日期' });
        return;
      }
      if (dayStatus !== undefined && !VALID_DAY_STATUSES.includes(dayStatus)) {
        json(res, 400, { success: false, errMsg: '无效日状态' });
        return;
      }
      for (const [label, period] of [
        ['上午', morning],
        ['下午', afternoon],
      ] as const) {
        const err = validatePeriod(period);
        if (err) {
          json(res, 400, { success: false, errMsg: `${label}: ${err}` });
          return;
        }
      }

      const finalDayStatus = dayStatus || 'free';
      const finalMorning =
        finalDayStatus === 'leave' ? FREE_PERIOD : normalizePeriod(morning) || FREE_PERIOD;
      const finalAfternoon =
        finalDayStatus === 'leave' ? FREE_PERIOD : normalizePeriod(afternoon) || FREE_PERIOD;

      await upsertAvailability(
        guideId,
        date,
        { dayStatus: finalDayStatus, morning: finalMorning, afternoon: finalAfternoon },
        user._id,
      );
      json(res, 200, { success: true });
      return;
    }

    // GET /source-options
    if (method === 'GET' && path === '/source-options') {
      const { data } = await db
        .collection('settings')
        .doc('global')
        .field({ sourceOptions: true })
        .get();
      const settings = Array.isArray(data) ? data[0] : data;
      json(res, 200, { success: true, data: settings?.sourceOptions || [] });
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
    'Routes: POST /api/login, GET /api/me, GET /api/my-availability, POST /api/set-availability, GET /api/daily-guides?date=, POST /api/update-status, GET /api/source-options',
  );
});
