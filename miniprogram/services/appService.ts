import { getSettings } from './settingsDb';

/** 获取导航栏高度信息 */
export function getNavBarInfo(): { statusBarHeight: number; navBarHeight: number } {
  try {
    const { statusBarHeight } = wx.getWindowInfo();
    const menuButton = wx.getMenuButtonBoundingClientRect();
    const navBarHeight = Math.ceil((menuButton.top - statusBarHeight) * 2 + menuButton.height);
    return { statusBarHeight, navBarHeight };
  } catch (_e) {
    return { statusBarHeight: 20, navBarHeight: 44 };
  }
}

/** 从缓存获取 settings */
export function getCachedSettings(): Partial<Settings> {
  try {
    return wx.getStorageSync('settings') || {};
  } catch (_e) {
    return {};
  }
}

/** 从云端获取 settings（单次请求，同时返回 phone 和 banner） */
export async function fetchRemoteSettings(): Promise<Settings> {
  const res = await getSettings();
  const settings = (res.data || {}) as Settings;
  try {
    wx.setStorageSync('settings', settings);
  } catch (_e) {
    /* ignore */
  }
  return settings;
}
