const availRepo = require('../repositories/availRepo');
const { db } = require('../shared/cloud');

const VALID_DAY_STATUSES = ['free', 'leave'];
const VALID_PERIOD_STATUSES = ['free', 'dispatched'];
const MAX_SOURCE_LEN = 20;

const FREE_PERIOD = { status: 'free' };

/** 校验单个时段 */
function validatePeriod(period) {
  if (!period) return null;
  if (!VALID_PERIOD_STATUSES.includes(period.status)) {
    return '无效时段状态';
  }
  if (period.status === 'dispatched') {
    const src = typeof period.source === 'string' ? period.source.trim() : '';
    if (!src) return '请选择派单平台';
    if (src.length > MAX_SOURCE_LEN) return `平台名称不超过${MAX_SOURCE_LEN}字`;
  }
  return null;
}

/** 规范化时段数据 */
function normalizePeriod(period) {
  if (!period) return undefined;
  if (period.status === 'free') return { status: 'free' };
  return { status: 'dispatched', source: period.source.trim() };
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

  const recordMap = {};
  for (const r of records) {
    recordMap[r.date] = r;
  }

  return dates.map((date) => {
    const r = recordMap[date];
    return {
      date,
      dayStatus: r?.dayStatus || 'free',
      morning: r?.morning || FREE_PERIOD,
      afternoon: r?.afternoon || FREE_PERIOD,
    };
  });
}

async function setAvailability(user, date, body) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { success: false, errMsg: '无效日期' };
  }

  const { dayStatus, morning, afternoon } = body;

  if (dayStatus !== undefined && !VALID_DAY_STATUSES.includes(dayStatus)) {
    return { success: false, errMsg: '无效日状态' };
  }

  for (const [label, period] of [['上午', morning], ['下午', afternoon]]) {
    const err = validatePeriod(period);
    if (err) return { success: false, errMsg: `${label}: ${err}` };
  }

  const finalDayStatus = dayStatus !== undefined ? dayStatus : 'free';
  const finalMorning = finalDayStatus === 'leave' ? FREE_PERIOD : (normalizePeriod(morning) || FREE_PERIOD);
  const finalAfternoon = finalDayStatus === 'leave' ? FREE_PERIOD : (normalizePeriod(afternoon) || FREE_PERIOD);

  const fields = {
    dayStatus: finalDayStatus,
    morning: finalMorning,
    afternoon: finalAfternoon,
  };

  await availRepo.upsert(user.guideId, date, fields, user._id);
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
  const recordMap = {};
  for (const r of records) {
    recordMap[r.guideId] = r;
  }

  const list = guideUsers.map((u) => {
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
  });

  return { success: true, data: list };
}

async function updateGuideStatus(operator, guideId, date, body) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { success: false, errMsg: '无效日期' };
  }

  const { dayStatus, morning, afternoon } = body;

  if (dayStatus !== undefined && !VALID_DAY_STATUSES.includes(dayStatus)) {
    return { success: false, errMsg: '无效日状态' };
  }

  for (const [label, period] of [['上午', morning], ['下午', afternoon]]) {
    const err = validatePeriod(period);
    if (err) return { success: false, errMsg: `${label}: ${err}` };
  }

  const finalDayStatus = dayStatus !== undefined ? dayStatus : 'free';
  const finalMorning = finalDayStatus === 'leave' ? FREE_PERIOD : (normalizePeriod(morning) || FREE_PERIOD);
  const finalAfternoon = finalDayStatus === 'leave' ? FREE_PERIOD : (normalizePeriod(afternoon) || FREE_PERIOD);

  const fields = {
    dayStatus: finalDayStatus,
    morning: finalMorning,
    afternoon: finalAfternoon,
  };

  await availRepo.upsert(guideId, date, fields, operator._id);
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
