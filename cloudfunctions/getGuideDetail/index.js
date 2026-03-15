const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const { guideId } = event;
  if (!guideId) {
    return { success: false, errMsg: 'guideId is required' };
  }
  try {
    const res = await db.collection('guides').doc(guideId).field({
      name: true,
      avatar: true,
      experienceYear: true,
      serviceCount: true,
      phone: true,
      licenseText: true,
      wechatServiceEnabled: true,
      status: true,
    }).get();
    if (!res.data || res.data.status === false) {
      return { success: false, errMsg: 'not found', data: null };
    }
    return { success: true, data: res.data };
  } catch (e) {
    return { success: false, errMsg: e.message };
  }
};
