export function getSettings(): Promise<DB.IQuerySingleResult> {
  return wx.cloud.database().collection('settings').doc('global').get();
}
