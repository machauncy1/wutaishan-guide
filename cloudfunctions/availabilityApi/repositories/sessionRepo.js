const { db } = require('../shared/cloud');

async function create(session) {
  const { _id, ...rest } = session;
  await db.collection('sessions').doc(_id).set({ data: rest });
}

async function findByToken(token) {
  try {
    const { data } = await db.collection('sessions').doc(token).get();
    return data;
  } catch (_e) {
    return null;
  }
}

async function revoke(token) {
  await db.collection('sessions').doc(token).update({ data: { isRevoked: true } });
}

module.exports = { create, findByToken, revoke };
