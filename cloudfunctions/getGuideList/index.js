const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async () => {
  try {
    const res = await db
      .collection('guides')
      .where({ status: true })
      .orderBy('sort', 'asc')
      .field({
        avatar: true,
        name: true,
        experienceYear: true,
        serviceCount: true,
        tags: true,
      })
      .get();
    return { success: true, data: res.data };
  } catch (e) {
    return { success: false, errMsg: e.message };
  }
};
