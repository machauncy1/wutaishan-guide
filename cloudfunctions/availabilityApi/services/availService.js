const availRepo = require('../repositories/availRepo');
const { db } = require('../shared/cloud');

const VALID_STATUSES = ['free', 'leave', 'morning', 'afternoon', 'allday'];
const DISPATCHED_STATUSES = ['morning', 'afternoon', 'allday'];
const VALID_SOURCES = ['ctrip', 'platform', 'other'];
const MAX_SOURCE_NOTE_LEN = 20;

/** 校验并规范化 source/sourceNote，返回 { source, sourceNote } 或 { errMsg } */
function normalizeSource(status, source, sourceNote) {
  if (!DISPATCHED_STATUSES.includes(status)) {
    return { source: null, sourceNote: null };
  }
  if (!source || !VALID_SOURCES.includes(source)) {
    return { errMsg: '请选择派单平台' };
  }
  if (source === 'other') {
    const note = typeof sourceNote === 'string' ? sourceNote.trim() : '';
    if (!note) return { errMsg: '请填写平台名称' };
    if (note.length > MAX_SOURCE_NOTE_LEN) return { errMsg: `平台名称不超过${MAX_SOURCE_NOTE_LEN}字` };
    return { source, sourceNote: note };
  }
  return { source, sourceNote: null };
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
    statusMap[r.date] = { status: r.status, source: r.source || null, sourceNote: r.sourceNote || null };
  }

  return dates.map((date) => {
    const entry = statusMap[date];
    return {
      date,
      status: entry ? entry.status : 'free',
      source: entry ? entry.source : null,
      sourceNote: entry ? entry.sourceNote : null,
    };
  });
}

async function setAvailability(user, date, status, source, sourceNote) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { success: false, errMsg: '无效日期' };
  }
  if (!VALID_STATUSES.includes(status)) {
    return { success: false, errMsg: '无效状态' };
  }
  const src = normalizeSource(status, source, sourceNote);
  if (src.errMsg) return { success: false, errMsg: src.errMsg };

  await availRepo.upsert(user.guideId, date, status, user._id, src.source, src.sourceNote);
  return { success: true };
}

async function getDailyGuides(date) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { success: false, errMsg: '无效日期' };
  }

  // Get all guide-role users
  const { data: guideUsers } = await db
    .collection('users')
    .where({ role: 'guide' })
    .field({ _id: true, name: true, guideId: true, phone: true })
    .limit(100)
    .get();

  // Get availability records for this date
  const records = await availRepo.findByDate(date);
  const statusMap = {};
  for (const r of records) {
    statusMap[r.guideId] = { status: r.status, source: r.source || null, sourceNote: r.sourceNote || null };
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
      sourceNote: entry ? entry.sourceNote : null,
    };
  });

  return { success: true, data: list };
}

async function updateGuideStatus(operator, guideId, date, status, source, sourceNote) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { success: false, errMsg: '无效日期' };
  }
  if (!VALID_STATUSES.includes(status)) {
    return { success: false, errMsg: '无效状态' };
  }
  const src = normalizeSource(status, source, sourceNote);
  if (src.errMsg) return { success: false, errMsg: src.errMsg };

  await availRepo.upsert(guideId, date, status, operator._id, src.source, src.sourceNote);
  return { success: true };
}

module.exports = { getMyAvailability, setAvailability, getDailyGuides, updateGuideStatus };
