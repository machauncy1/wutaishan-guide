// pages/index/index.js
import { getGuideList } from '../../services/guide';
import { getSettings } from '../../services/settings';

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
    this.setData({ loading: true });
    try {
      const [settingsRes, guidesRes] = await Promise.all([
        getSettings(),
        getGuideList(),
      ]);
      this.setData({
        settings: settingsRes.result.data || {},
        guideList: guidesRes.result.data || [],
        loading: false,
      });
    } catch (e) {
      console.error('加载数据失败', e);
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败，请重试', icon: 'none' });
    }
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
