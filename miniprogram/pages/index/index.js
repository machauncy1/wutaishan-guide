// pages/index/index.js
import { getGuideList } from '../../services/guide';
import { getSettings } from '../../services/settings';
import { getTempFileURLMap } from '../../services/cloudFile';
import { prefetchGuide } from '../../services/guideCache';

Page({
  data: {
    settings: {},
    guideList: [],
    loading: true,
    bannerLoaded: false,
    // 自定义导航栏高度计算
    statusBarHeight: 20,
    navBarHeight: 44,
  },

  onLoad() {
    this._initNavHeight();
    this._loadFromCache();
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  _initNavHeight() {
    try {
      const { statusBarHeight } = wx.getSystemInfoSync();
      const menuButton = wx.getMenuButtonBoundingClientRect();
      const navBarHeight = (menuButton.top - statusBarHeight) * 2 + menuButton.height;
      this.setData({ statusBarHeight, navBarHeight });
    } catch (e) {
      // 获取失败时使用默认值
    }
  },

  _loadFromCache() {
    try {
      const settings = wx.getStorageSync('settings');
      const guideList = wx.getStorageSync('guideList');
      if (settings || (guideList && guideList.length)) {
        this.setData({
          settings: settings || {},
          guideList: guideList || [],
          loading: false,
        });
      }
    } catch (e) {
      /* ignore */
    }
  },

  async loadData() {
    // 已有数据时静默刷新，不显示骨架屏
    if (!this.data.guideList.length) {
      this.setData({ loading: true });
    }
    try {
      const [settingsRes, guidesRes] = await Promise.all([getSettings(), getGuideList()]);
      const settings = settingsRes.data || {};
      const guideList = guidesRes.data || [];

      // 缓存到本地，下次打开秒开
      try {
        wx.setStorageSync('settings', settings);
        wx.setStorageSync('guideList', guideList);
      } catch (e) {
        /* ignore */
      }
      this.setData({ settings, guideList, loading: false });
      this._resolveCloudFileURLs(guideList);
      this._observeGuideCards(guideList);
    } catch (e) {
      console.error('加载数据失败', e);
      // 有缓存数据时静默失败
      if (!this.data.guideList.length) {
        this.setData({ loading: false });
        wx.showToast({ title: '加载失败，请重试', icon: 'none' });
      }
    }
  },

  async _resolveCloudFileURLs(guideList) {
    // banner 直接用 cloud:// 协议渲染，只转换头像
    const urlMap = await getTempFileURLMap(guideList.map((g) => g.avatar));
    if (!Object.keys(urlMap).length) return;

    const updated = {};
    guideList.forEach((g, i) => {
      if (urlMap[g.avatar]) {
        updated[`guideList[${i}].avatar`] = urlMap[g.avatar];
      }
    });
    if (Object.keys(updated).length) this.setData(updated);
  },

  _observeGuideCards(guideList) {
    if (this._observer) this._observer.disconnect();
    if (!guideList.length) return;

    try {
      const observer = this.createIntersectionObserver({ observeAll: true });
      observer.relativeToViewport({ bottom: 200 }).observe('.card-wrap', (res) => {
        if (res.intersectionRatio > 0) {
          const id = res.dataset && res.dataset.id;
          if (id) prefetchGuide(id);
        }
      });
      this._observer = observer;
    } catch (e) {
      // 部分低版本基础库不支持 IntersectionObserver，静默降级
    }
  },

  onGuideTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/guideDetail/index?id=${id}`,
    });
  },

  onBannerLoad() {
    this.setData({ bannerLoaded: true });
  },

  onPhoneCall() {
    const phone = this.data.settings.contactPhone;
    if (!phone) return;
    wx.makePhoneCall({ phoneNumber: phone });
  },
});
