const { db } = require('../shared/cloud');

async function findByPhone(phone) {
  const { data } = await db.collection('users').where({ phone }).limit(1).get();
  return data[0] || null;
}

async function findById(userId) {
  try {
    const { data } = await db.collection('users').doc(userId).get();
    return data;
  } catch (_e) {
    return null;
  }
}

module.exports = { findByPhone, findById };
