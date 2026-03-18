import { getSettings } from './settings';

/** 获取导航栏高度信息 */
export function getNavBarInfo(): { statusBarHeight: number; navBarHeight: number } {
  try {
    const { statusBarHeight } = wx.getWindowInfo();
    const menuButton = wx.getMenuButtonBoundingClientRect();
    const navBarHeight = (menuButton.top - statusBarHeight) * 2 + menuButton.height;
    return { statusBarHeight, navBarHeight };
  } catch (_e) {
    return { statusBarHeight: 20, navBarHeight: 44 };
  }
}

/** 从缓存获取联系电话 */
export function getCachedContactPhone(): string {
  try {
    const cached = wx.getStorageSync('settings');
    return (cached && cached.contactPhone) || '';
  } catch (_e) {
    return '';
  }
}

/** 从云端获取联系电话 */
export async function fetchContactPhone(): Promise<string> {
  const res = await getSettings();
  const settings = (res.data || {}) as Settings;
  return settings.contactPhone || '';
}
