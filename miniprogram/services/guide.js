// services/guide.js

export function getGuideList() {
  return wx.cloud.callFunction({
    name: 'getGuideList',
  });
}

export function getGuideDetail(guideId) {
  return wx.cloud.callFunction({
    name: 'getGuideDetail',
    data: { guideId },
  });
}

export function adminUpsertGuide(data) {
  return wx.cloud.callFunction({
    name: 'adminUpsertGuide',
    data,
  });
}

export function adminDeleteGuide(guideId) {
  return wx.cloud.callFunction({
    name: 'adminDeleteGuide',
    data: { guideId },
  });
}

export function adminGetGuideList(data) {
  return wx.cloud.callFunction({
    name: 'adminGetGuideList',
    data,
  });
}
