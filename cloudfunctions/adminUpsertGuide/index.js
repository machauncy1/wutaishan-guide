const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const { id, name, avatar, gender, experienceYear, serviceCount, tags,
          description, phone, agencyName, licenseText,
          wechatServiceEnabled, status, sort } = event;

  const now = Date.now();

  try {
    if (id) {
      // 更新
      await db.collection('guides').doc(id).update({
        data: {
          name, avatar, gender, experienceYear, serviceCount, tags,
          description, phone, agencyName, licenseText,
          wechatServiceEnabled, status, sort,
          updatedAt: now,
        },
      });
      return { success: true, action: 'updated', id };
    } else {
      // 新增
      const res = await db.collection('guides').add({
        data: {
          name, avatar, gender, experienceYear, serviceCount, tags,
          description, phone, agencyName, licenseText,
          wechatServiceEnabled: wechatServiceEnabled !== false,
          status: status !== false,
          sort: sort || 99,
          createdAt: now,
          updatedAt: now,
        },
      });
      return { success: true, action: 'created', id: res._id };
    }
  } catch (e) {
    return { success: false, errMsg: e.message };
  }
};
