// services/settings.js

export function getSettings() {
  return wx.cloud.callFunction({
    name: 'getSettings',
  });
}
