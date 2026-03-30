const availRepo = require('../repositories/availRepo');
const { db } = require('../shared/cloud');

const VALID_DAY_STATUSES = ['free', 'leave'];
const VALID_PERIOD_STATUSES = ['free', 'dispatched'];
const MAX_SOURCE_LEN = 20;

const FREE_PERIOD = { status: 'free' };

/** 根据新格式字段计算冗余的旧格式 status/source（回滚兼容） */
function toLegacyFields(dayStatus, morning, afternoon) {
  if (dayStatus === 'leave') return { status: 'leave', source: null };
  const mDisp = morning && morning.status === 'dispatched';
  const aDisp = afternoon && afternoon.status === 'dispatched';
  if (mDisp && aDisp) {
    const src =
      morning.source === afternoon.source
        ? morning.source
        : `${morning.source}/${afternoon.source}`;
    return { status: 'allday', source: src };
  }
  if (mDisp) return { status: 'morning', source: morning.source || null };
  if (aDisp) return { status: 'afternoon', source: afternoon.source || null };
  return { status: 'free', source: null };
}

/** 将旧格式记录转换为新格式（兼容已有数据） */
function normalizeRecord(r) {
  // 新格式：已有 dayStatus 字段
  if (r.dayStatus !== undefined) {
    return {
      dayStatus: r.dayStatus,
      morning: r.morning || FREE_PERIOD,
      afternoon: r.afternoon || FREE_PERIOD,
    };
  }
  // 旧格式：status 字段
  const source = r.source || undefined;
  switch (r.status) {
    case 'leave':
      return { dayStatus: 'leave', morning: FREE_PERIOD, afternoon: FREE_PERIOD };
    case 'morning':
      return {
        dayStatus: 'free',
        morning: { status: 'dispatched', source },
        afternoon: FREE_PERIOD,
      };
    case 'afternoon':
      return {
        dayStatus: 'free',
        morning: FREE_PERIOD,
        afternoon: { status: 'dispatched', source },
      };
    case 'allday':
      return {
        dayStatus: 'free',
        morning: { status: 'dispatched', source },
        afternoon: { status: 'dispatched', source },
      };
    default:
      return { dayStatus: 'free', morning: FREE_PERIOD, afternoon: FREE_PERIOD };
  }
}

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
    recordMap[r.date] = normalizeRecord(r);
  }

  return dates.map((date) => {
    const entry = recordMap[date];
    if (entry) {
      return { date, dayStatus: entry.dayStatus, morning: entry.morning, afternoon: entry.afternoon };
    }
    return { date, dayStatus: 'free', morning: FREE_PERIOD, afternoon: FREE_PERIOD };
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

  // 校验时段
  for (const [label, period] of [['上午', morning], ['下午', afternoon]]) {
    const err = validatePeriod(period);
    if (err) return { success: false, errMsg: `${label}: ${err}` };
  }

  const finalDayStatus = dayStatus !== undefined ? dayStatus : 'free';
  const finalMorning = finalDayStatus === 'leave' ? FREE_PERIOD : (normalizePeriod(morning) || FREE_PERIOD);
  const finalAfternoon = finalDayStatus === 'leave' ? FREE_PERIOD : (normalizePeriod(afternoon) || FREE_PERIOD);
  const legacy = toLegacyFields(finalDayStatus, finalMorning, finalAfternoon);

  const fields = {
    dayStatus: finalDayStatus,
    morning: finalMorning,
    afternoon: finalAfternoon,
    // 冗余旧字段，确保回滚旧代码时可读
    status: legacy.status,
    source: legacy.source,
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
    recordMap[r.guideId] = normalizeRecord(r);
  }

  const list = guideUsers.map((u) => {
    const entry = recordMap[u.guideId];
    return {
      userId: u._id,
      guideId: u.guideId,
      name: u.name,
      phone: u.phone,
      dayStatus: entry ? entry.dayStatus : 'free',
      morning: entry ? entry.morning : FREE_PERIOD,
      afternoon: entry ? entry.afternoon : FREE_PERIOD,
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
  const legacy = toLegacyFields(finalDayStatus, finalMorning, finalAfternoon);

  const fields = {
    dayStatus: finalDayStatus,
    morning: finalMorning,
    afternoon: finalAfternoon,
    status: legacy.status,
    source: legacy.source,
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
