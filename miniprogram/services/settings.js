// services/settings.js

export function getSettings() {
  return wx.cloud.database()
    .collection('settings')
    .doc('global')
    .get();
}
