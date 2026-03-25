const availRepo = require('../repositories/availRepo');
const { db } = require('../shared/cloud');

const VALID_STATUSES = ['free', 'leave', 'morning', 'afternoon', 'allday'];

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
  const dates = getDateRange(7);
  const records = await availRepo.findByGuideAndDateRange(
    user.guideId,
    dates[0],
    dates[dates.length - 1],
  );

  const statusMap = {};
  for (const r of records) {
    statusMap[r.date] = r.status;
  }

  return dates.map((date) => ({
    date,
    status: statusMap[date] || 'free',
  }));
}

async function setAvailability(user, date, status) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { success: false, errMsg: '无效日期' };
  }
  if (!VALID_STATUSES.includes(status)) {
    return { success: false, errMsg: '无效状态' };
  }

  await availRepo.upsert(user.guideId, date, status, user._id);
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
    statusMap[r.guideId] = r.status;
  }

  const list = guideUsers.map((u) => ({
    userId: u._id,
    guideId: u.guideId,
    name: u.name,
    phone: u.phone,
    status: statusMap[u.guideId] || 'free',
  }));

  return { success: true, data: list };
}

async function updateGuideStatus(operator, guideId, date, status) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { success: false, errMsg: '无效日期' };
  }
  if (!VALID_STATUSES.includes(status)) {
    return { success: false, errMsg: '无效状态' };
  }

  await availRepo.upsert(guideId, date, status, operator._id);
  return { success: true };
}

module.exports = { getMyAvailability, setAvailability, getDailyGuides, updateGuideStatus };
