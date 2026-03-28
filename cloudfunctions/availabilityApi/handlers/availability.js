const availService = require('../services/availService');

async function handleGetMyAvailability(user) {
  if (user.role !== 'guide') {
    return { success: false, errMsg: '仅导游可访问' };
  }
  const data = await availService.getMyAvailability(user);
  return { success: true, data };
}

async function handleSetAvailability(user, body) {
  if (user.role !== 'guide') {
    return { success: false, errMsg: '仅导游可操作' };
  }
  return availService.setAvailability(user, body.date, body.status, body.source);
}

async function handleGetDailyGuides(user, query) {
  if (user.role !== 'admin') {
    return { success: false, errMsg: '仅管理员可访问' };
  }
  return availService.getDailyGuides(query.date);
}

async function handleUpdateGuideStatus(user, body) {
  if (user.role !== 'admin') {
    return { success: false, errMsg: '仅管理员可操作' };
  }
  return availService.updateGuideStatus(user, body.guideId, body.date, body.status, body.source);
}

async function handleGetSourceOptions() {
  return availService.getSourceOptions();
}

module.exports = {
  handleGetMyAvailability,
  handleSetAvailability,
  handleGetDailyGuides,
  handleUpdateGuideStatus,
  handleGetSourceOptions,
};
