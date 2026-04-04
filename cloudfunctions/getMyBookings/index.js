const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

// Repository 层：数据库操作
const bookingsRepo = {
  async findByOpenid(openid) {
    const { data } = await db
      .collection('bookings')
      .where({ openid })
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
    return data;
  },
};

exports.main = async () => {
  const { OPENID } = cloud.getWXContext();
  if (!OPENID) {
    return { success: false, errMsg: '未获取到用户身份' };
  }

  try {
    const data = await bookingsRepo.findByOpenid(OPENID);

    // createdAt 是 Date 对象，序列化为 ISO 字符串方便前端展示
    const bookings = data.map((item) => ({
      ...item,
      createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt,
    }));

    return { success: true, bookings };
  } catch (_e) {
    return { success: false, errMsg: '查询失败' };
  }
};
