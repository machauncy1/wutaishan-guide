const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

exports.main = async (event) => {
  const { page = 1, pageSize = 20, keyword = '' } = event;
  const skip = (page - 1) * pageSize;

  try {
    let query = db.collection('guides');

    if (keyword) {
      // 简单关键词匹配（名字包含）
      query = query.where({
        name: db.RegExp({ regexp: keyword, options: 'i' }),
      });
    }

    const [countRes, listRes] = await Promise.all([
      query.count(),
      query.orderBy('sort', 'asc').skip(skip).limit(pageSize).get(),
    ]);

    return {
      success: true,
      data: listRes.data,
      total: countRes.total,
      page,
      pageSize,
    };
  } catch (e) {
    return { success: false, errMsg: e.message };
  }
};
