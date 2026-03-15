const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const { guideId } = event;
  if (!guideId) {
    return { success: false, errMsg: 'guideId is required' };
  }
  try {
    const res = await db.collection('guides').doc(guideId).get();
    if (!res.data || res.data.status === false) {
      return { success: false, errMsg: 'not found', data: null };
    }
    const guide = res.data;
    if (guide.avatar) {
      const urlRes = await cloud.getTempFileURL({ fileList: [guide.avatar] });
      guide.avatar = urlRes.fileList[0].tempFileURL || guide.avatar;
    }
    return { success: true, data: guide };
  } catch (e) {
    return { success: false, errMsg: e.message };
  }
};
