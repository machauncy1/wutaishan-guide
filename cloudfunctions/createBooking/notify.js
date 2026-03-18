const https = require('https');

const WXWORK_WEBHOOK_KEY = process.env.WXWORK_WEBHOOK_KEY || '';
const WXWORK_WEBHOOK_URL = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${WXWORK_WEBHOOK_KEY}`;

function sendWxwork(content) {
  if (!WXWORK_WEBHOOK_KEY) {
    console.warn('WXWORK_WEBHOOK_KEY 未配置，跳过企业微信通知');
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      msgtype: 'markdown',
      markdown: { content },
    });
    const url = new URL(WXWORK_WEBHOOK_URL);
    const req = https.request(
      {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      },
      (res) => {
        res.resume();
        res.on('end', resolve);
      }
    );
    req.on('error', (e) => {
      console.error('企业微信通知发送失败:', e);
      resolve();
    });
    req.end(payload);
  });
}

/**
 * 发送预约通知到所有渠道
 */
async function notifyBooking(record) {
  const content = [
    '## 📋 小程序平台 · 新预约单',
    `> 来源：<font color="info">五台山导游小程序</font>`,
    '',
    `**导游：**${record.guideName}`,
    `**游客：**${record.touristName || '未填写'}`,
    `**手机：**${record.touristPhone}`,
    `**日期：**${record.date} ${record.timePeriod}`,
    `**人数：**${record.groupSize} 人`,
    record.remark ? `**备注：**${record.remark}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  await Promise.allSettled([sendWxwork(content)]);
}

module.exports = { notifyBooking };
