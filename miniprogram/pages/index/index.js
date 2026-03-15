// pages/index/index.js
import { getGuideList } from '../../services/guide';
import { getSettings } from '../../services/settings';
import { getTempFileURLMap } from '../../services/cloudFile';

Page({
  data: {
    settings: {},
    guideList: [],
    loading: true,
    // 自定义导航栏高度计算
    statusBarHeight: 20,
    navBarHeight: 44,
  },

  onLoad() {
    this._initNavHeight();
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

  async loadData() {
    // 已有数据时静默刷新，不显示骨架屏
    if (!this.data.guideList.length) {
      this.setData({ loading: true });
    }
    try {
      const [settingsRes, guidesRes] = await Promise.all([
        getSettings(),
        getGuideList(),
      ]);
      const settings = settingsRes.result.data || {};
      const guideList = guidesRes.result.data || [];

      // 先渲染数据，再异步转换图片链接（不阻塞列表展示）
      this.setData({ settings, guideList, loading: false });
      this._resolveCloudFileURLs(settings, guideList);
    } catch (e) {
      console.error('加载数据失败', e);
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败，请重试', icon: 'none' });
    }
  },

  async _resolveCloudFileURLs(settings, guideList) {
    const urlMap = await getTempFileURLMap([
      settings.bannerImage,
      ...guideList.map((g) => g.avatar),
    ]);
    if (!Object.keys(urlMap).length) return;

    const updated = {};
    if (urlMap[settings.bannerImage]) {
      updated['settings.bannerImage'] = urlMap[settings.bannerImage];
    }
    guideList.forEach((g, i) => {
      if (urlMap[g.avatar]) {
        updated[`guideList[${i}].avatar`] = urlMap[g.avatar];
      }
    });
    if (Object.keys(updated).length) this.setData(updated);
  },

  onGuideTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/guideDetail/index?id=${id}`,
    });
  },

  onPhoneCall() {
    const phone = this.data.settings.contactPhone;
    if (!phone) return;
    wx.makePhoneCall({ phoneNumber: phone });
  },
});
