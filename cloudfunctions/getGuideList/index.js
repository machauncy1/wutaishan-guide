const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

exports.main = async () => {
  try {
    const res = await db
      .collection('guides')
      .where({ status: true })
      .orderBy('sort', 'asc')
      .field({
        avatar: true,
        name: true,
        gender: true,
        experienceYear: true,
        serviceCount: true,
        tags: true,
        agencyName: true,
        licenseText: true,
      })
      .get();
    return { success: true, data: res.data };
  } catch (e) {
    return { success: false, errMsg: e.message };
  }
};
