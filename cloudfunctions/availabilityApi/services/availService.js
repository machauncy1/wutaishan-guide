const availRepo = require('../repositories/availRepo');
const { db } = require('../shared/cloud');

const VALID_STATUSES = ['free', 'leave', 'morning', 'afternoon', 'allday'];
const DISPATCHED_STATUSES = ['morning', 'afternoon', 'allday'];
const MAX_SOURCE_LEN = 20;

/** 校验并规范化 source，返回 { source } 或 { errMsg } */
function normalizeSource(status, source) {
  if (!DISPATCHED_STATUSES.includes(status)) {
    return { source: null };
  }
  const trimmed = typeof source === 'string' ? source.trim() : '';
  if (!trimmed) {
    return { errMsg: '请选择派单平台' };
  }
  if (trimmed.length > MAX_SOURCE_LEN) {
    return { errMsg: `平台名称不超过${MAX_SOURCE_LEN}字` };
  }
  return { source: trimmed };
}

function getDateRange(days) {
  const dates = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' }));
  }
  return dates;
}

async function getMyAvailability(user) {
  const dates = getDateRange(30);
  const records = await availRepo.findByGuideAndDateRange(
    user.guideId,
    dates[0],
    dates[dates.length - 1],
  );

  const statusMap = {};
  for (const r of records) {
    statusMap[r.date] = { status: r.status, source: r.source || null };
  }

  return dates.map((date) => {
    const entry = statusMap[date];
    return {
      date,
      status: entry ? entry.status : 'free',
      source: entry ? entry.source : null,
    };
  });
}

async function setAvailability(user, date, status, source) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { success: false, errMsg: '无效日期' };
  }
  if (!VALID_STATUSES.includes(status)) {
    return { success: false, errMsg: '无效状态' };
  }
  const src = normalizeSource(status, source);
  if (src.errMsg) return { success: false, errMsg: src.errMsg };

  await availRepo.upsert(user.guideId, date, status, user._id, src.source);
  return { success: true };
}

async function getDailyGuides(date) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { success: false, errMsg: '无效日期' };
  }

  const { data: guideUsers } = await db
    .collection('users')
    .where({ role: 'guide' })
    .field({ _id: true, name: true, guideId: true, phone: true })
    .limit(100)
    .get();

  const records = await availRepo.findByDate(date);
  const statusMap = {};
  for (const r of records) {
    statusMap[r.guideId] = { status: r.status, source: r.source || null };
  }

  const list = guideUsers.map((u) => {
    const entry = statusMap[u.guideId];
    return {
      userId: u._id,
      guideId: u.guideId,
      name: u.name,
      phone: u.phone,
      status: entry ? entry.status : 'free',
      source: entry ? entry.source : null,
    };
  });

  return { success: true, data: list };
}

async function updateGuideStatus(operator, guideId, date, status, source) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { success: false, errMsg: '无效日期' };
  }
  if (!VALID_STATUSES.includes(status)) {
    return { success: false, errMsg: '无效状态' };
  }
  const src = normalizeSource(status, source);
  if (src.errMsg) return { success: false, errMsg: src.errMsg };

  await availRepo.upsert(guideId, date, status, operator._id, src.source);
  return { success: true };
}

async function getSourceOptions() {
  const { data } = await db
    .collection('settings')
    .doc('global')
    .field({ sourceOptions: true })
    .get();
  return { success: true, data: data.sourceOptions || [] };
}

module.exports = {
  getMyAvailability,
  setAvailability,
  getDailyGuides,
  updateGuideStatus,
  getSourceOptions,
};
