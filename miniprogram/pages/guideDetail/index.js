// pages/guideDetail/index.js
import { getGuideDetail } from '../../services/guide';
import { getSettings } from '../../services/settings';
import { getTempFileURLMap } from '../../services/cloudFile';
import { getCachedGuide } from '../../services/guideCache';

Page({
  data: {
    settings: {},
    guide: null,
    loading: true,
    statusBarHeight: 20,
    navBarHeight: 44,
    trustPoints: [],
    serviceScope: [],
    bookingArrangement: [],
    heroSubtitle: '',
    avatarLoaded: false,
    reviewList: [],
    reviewTotal: 0,
    reviewScore: '5.0',
    showAllReviews: false,
  },

  onLoad(options) {
    const { id } = options;
    this._initNavHeight();
    // 从缓存立即读取 settings，banner 图与云函数并行加载
    try {
      const cached = wx.getStorageSync('settings');
      if (cached) this.setData({ settings: cached });
    } catch (e) { /* ignore */ }
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

  _applyGuide(guide, settings) {
    const allReviews = this.buildReviews(guide.reviews || []);
    this._allReviews = allReviews;
    this.setData({
      guide,
      settings,
      loading: false,
      trustPoints: this.buildTrustPoints(guide),
      serviceScope: this.buildServiceScope(),
      bookingArrangement: this.buildBookingArrangement(guide),
      heroSubtitle: this.buildHeroSubtitle(guide),
      reviewList: this.data.showAllReviews ? allReviews : allReviews.slice(0, 3),
      reviewTotal: allReviews.length,
      reviewScore: this.calcReviewScore(allReviews),
    });
    this._resolveCloudFileURLs(guide);
  },

  async loadGuide(id) {
    // 优先使用预加载缓存，秒开详情
    const cached = getCachedGuide(id);
    if (cached) {
      this._applyGuide(cached, this.data.settings);
    } else if (!this.data.guide) {
      this.setData({ loading: true });
    }

    // 始终从云端拉取最新数据
    try {
      const [guideRes, settingsRes] = await Promise.all([
        getGuideDetail(id),
        getSettings(),
      ]);
      const guide = guideRes.data;
      const settings = settingsRes.data || {};
      if (!guide || guide.status === false) {
        wx.showToast({ title: '导游不存在', icon: 'none' });
        wx.navigateBack();
        return;
      }
      this._applyGuide(guide, settings);
    } catch (e) {
      console.error('加载导游详情失败', e);
      // 如果已有缓存数据，静默失败即可
      if (!this.data.guide) {
        this.setData({ loading: false });
        wx.showToast({ title: '加载失败，请重试', icon: 'none' });
      }
    }
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

  buildBookingArrangement(guide) {
    const items = [
      '具体接待导游将根据出行日期、人数、路线和实际档期协调安排。',
      '节假日、初一十五和暑期客流较大，建议尽早确认出发时间与行程需求。',
      '如需接站、包车服务，请在咨询时一并说明，方便统一衔接安排。',
    ];

    return guide.phone ? items.slice(0, 3) : items.slice(0, 2);
  },

  buildReviews(rawReviews) {
    return rawReviews.map(r => ({
      ...r,
      stars: Array.from({ length: 5 }, (_, i) => i < r.rating ? '★' : '☆'),
    }));
  },

  calcReviewScore(reviews) {
    if (!reviews.length) return '5.0';
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    return avg.toFixed(1);
  },

  onToggleReviews() {
    const show = !this.data.showAllReviews;
    this.setData({
      showAllReviews: show,
      reviewList: show ? this._allReviews : this._allReviews.slice(0, 3),
    });
  },

  onAvatarLoad() {
    this.setData({ avatarLoaded: true });
  },

  async _resolveCloudFileURLs(guide) {
    // banner 直接用 cloud:// 协议渲染，只转换头像
    const urlMap = await getTempFileURLMap([guide.avatar]);
    if (!Object.keys(urlMap).length) return;

    const updated = {};
    if (urlMap[guide.avatar]) updated['guide.avatar'] = urlMap[guide.avatar];
    if (Object.keys(updated).length) this.setData(updated);
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
