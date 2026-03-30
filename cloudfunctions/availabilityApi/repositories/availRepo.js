const { db, _ } = require('../shared/cloud');

const COLLECTION = 'guide_availability';

async function findByGuideAndDateRange(guideId, startDate, endDate) {
  const { data } = await db
    .collection(COLLECTION)
    .where({
      guideId,
      date: _.gte(startDate).and(_.lte(endDate)),
    })
    .get();
  return data;
}

async function findByDate(date) {
  const { data } = await db.collection(COLLECTION).where({ date }).get();
  return data;
}

async function upsert(guideId, date, fields, updatedBy) {
  const now = Date.now();
  const record = { ...fields, updatedBy, updatedAt: now };
  const { data: existing } = await db
    .collection(COLLECTION)
    .where({ guideId, date })
    .limit(1)
    .get();

  if (existing.length > 0) {
    await db.collection(COLLECTION).doc(existing[0]._id).update({ data: record });
  } else {
    await db.collection(COLLECTION).add({
      data: { guideId, date, ...record },
    });
  }
}

module.exports = { findByGuideAndDateRange, findByDate, upsert };
