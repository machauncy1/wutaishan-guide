const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async () => {
  try {
    const res = await db.collection('settings').doc('global').get();
    const settings = res.data;
    if (settings.bannerImage) {
      const urlRes = await cloud.getTempFileURL({ fileList: [settings.bannerImage] });
      settings.bannerImage = urlRes.fileList[0].tempFileURL || settings.bannerImage;
    }
    return { success: true, data: settings };
  } catch (e) {
    return { success: false, errMsg: e.message };
  }
};
