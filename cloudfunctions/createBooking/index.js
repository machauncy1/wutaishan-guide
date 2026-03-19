const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const { notifyBooking } = require('./notify');

const db = cloud.database();
const _ = db.command;
const PHONE_RE = /^1[3-9]\d{9}$/;
const VALID_PERIODS = ['上午', '下午'];
const DEDUP_MS = 5 * 60 * 1000;

exports.main = async (event) => {
  try {
    const { OPENID } = cloud.getWXContext();
    const { guideId, guideName, touristName, touristPhone, date, timePeriod, groupSize, remark } = event;

    // ===== 参数校验 =====
    if (!guideId || typeof guideId !== 'string') {
      return { success: false, errMsg: '无效的导游 ID' };
    }
    if (!guideName || typeof guideName !== 'string') {
      return { success: false, errMsg: '缺少导游姓名' };
    }
    // touristName 选填，不做必填校验
    if (!touristPhone || !PHONE_RE.test(touristPhone)) {
      return { success: false, errMsg: '请填写正确的手机号' };
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return { success: false, errMsg: '请选择有效日期' };
    }
    // 禁止选过去日期（按北京时间比较）
    const now = new Date();
    const bjOffset = 8 * 60 * 60 * 1000;
    const todayStr = new Date(now.getTime() + bjOffset).toISOString().slice(0, 10);
    if (date < todayStr) {
      return { success: false, errMsg: '不能选择过去的日期' };
    }
    if (!VALID_PERIODS.includes(timePeriod)) {
      return { success: false, errMsg: '请选择时段' };
    }
    const size = Number(groupSize);
    if (!Number.isInteger(size) || size < 1 || size > 20) {
      return { success: false, errMsg: '人数须为 1-20 之间的整数' };
    }

    // ===== 防重复提交 =====
    const dedupTime = new Date(now.getTime() - DEDUP_MS);
    const { data: existing } = await db.collection('bookings')
      .where({
        openid: OPENID,
        guideId,
        date,
        createdAt: _.gte(dedupTime),
      })
      .limit(1)
      .get();

    if (existing.length > 0) {
      return { success: false, errMsg: '您已提交过该需求，请勿重复提交' };
    }

    // ===== 写入 =====
    const record = {
      guideId,
      guideName,
      openid: OPENID,
      touristName: (touristName || '').trim(),
      touristPhone,
      date,
      timePeriod,
      groupSize: size,
      remark: (remark || '').trim().slice(0, 200),
      createdAt: db.serverDate(),
    };

    await db.collection('bookings').add({ data: record });

    // 发送通知（失败不影响提交结果）
    await notifyBooking(record).catch((e) => {
      console.error('通知发送异常:', e);
    });

    return { success: true };
  } catch (e) {
    console.error('createBooking error:', e);
    return { success: false, errMsg: '提交失败，请稍后重试' };
  }
};
