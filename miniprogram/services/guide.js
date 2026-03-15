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