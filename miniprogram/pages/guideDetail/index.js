// pages/guideDetail/index.js
import { getGuideDetail } from '../../services/guide';
import { getSettings } from '../../services/settings';
import { getTempFileURLMap } from '../../services/cloudFile';

Page({
  data: {
    settings: {},
    guide: null,
    loading: true,
    heroBannerLoaded: false,
    statusBarHeight: 20,
    navBarHeight: 44,
    contactSubtitle: '',
    trustPoints: [],
    serviceScope: [],
    bookingArrangement: [],
    heroSubtitle: '',
    serviceDescription: '',
  },

  onLoad(options) {
    const { id } = options;
    this._initNavHeight();
    if (!id) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      return;
    }
    this.loadGuide(id);
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

  async loadGuide(id) {
    // 已有数据时静默刷新，不显示骨架屏
    if (!this.data.guide) {
      this.setData({ loading: true });
    }
    try {
      const [guideRes, settingsRes] = await Promise.all([
        getGuideDetail(id),
        getSettings(),
      ]);
      const guide = guideRes.result.data;
      const settings = settingsRes.result.data || {};
      if (!guide) {
        wx.showToast({ title: '导游不存在', icon: 'none' });
        wx.navigateBack();
        return;
      }

      // 先渲染数据，再异步转换图片链接（不阻塞详情展示）
      this.setData({
        guide,
        settings,
        loading: false,
        contactSubtitle: this.buildContactSubtitle(guide),
        trustPoints: this.buildTrustPoints(guide),
        serviceScope: this.buildServiceScope(),
        bookingArrangement: this.buildBookingArrangement(guide),
        heroSubtitle: this.buildHeroSubtitle(guide),
        serviceDescription: this.buildServiceDescription(guide),
      });
      this._resolveCloudFileURLs(settings, guide);
    } catch (e) {
      console.error('加载导游详情失败', e);
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败，请重试', icon: 'none' });
    }
  },

  buildContactSubtitle(guide) {
    return [guide.licenseText, '平台统一协调安排'].filter(Boolean).join(' · ');
  },

  buildHeroSubtitle(guide) {
    return `${guide.licenseText || '本地持证导游'}，平台统一协调安排`;
  },

  buildTrustPoints(guide) {
    return [
      { label: '从业经验', value: `${guide.experienceYear}年` },
      { label: '累计服务', value: `${guide.serviceCount}+游客` },
    ];
  },

  buildServiceScope() {
    return [
      '五台山景区内专业讲解与规划',
      '接站、包车等出行协助沟通',
    ];
  },

  buildServiceDescription(guide) {
    return '';
  },

  buildBookingArrangement(guide) {
    const items = [
      '具体接待导游将根据出行日期、人数、路线和实际档期协调安排。',
      '节假日、初一十五和暑期客流较大，建议尽早确认出发时间与行程需求。',
      '如需接站、包车服务，请在咨询时一并说明，方便统一衔接安排。',
    ];

    return guide.phone ? items.slice(0, 3) : items.slice(0, 2);
  },

  async _resolveCloudFileURLs(settings, guide) {
    const urlMap = await getTempFileURLMap([settings.bannerImage, guide.avatar]);
    if (!Object.keys(urlMap).length) return;

    const updated = {};
    if (urlMap[settings.bannerImage]) updated['settings.bannerImage'] = urlMap[settings.bannerImage];
    if (urlMap[guide.avatar]) updated['guide.avatar'] = urlMap[guide.avatar];
    if (Object.keys(updated).length) this.setData(updated);
  },

  onHeroBannerLoad() {
    this.setData({ heroBannerLoaded: true });
  },

  onBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
      return;
    }
    wx.reLaunch({ url: '/pages/index/index' });
  },

  onPhoneCall() {
    const phone = this.data.guide && this.data.guide.phone;
    if (!phone) return;
    wx.makePhoneCall({ phoneNumber: phone });
  },
});
