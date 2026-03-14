const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const { guideId } = event;
  if (!guideId) {
    return { success: false, errMsg: 'guideId is required' };
  }
  try {
    // 软删除：status 置为 false
    await db.collection('guides').doc(guideId).update({
      data: { status: false, updatedAt: Date.now() },
    });
    return { success: true };
  } catch (e) {
    return { success: false, errMsg: e.message };
  }
};
