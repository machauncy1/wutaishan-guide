import { getGuideDetail } from '../../services/guide';
import { getSettings } from '../../services/settings';
import { resolveAvatars } from '../../services/cloudFile';
import { getCachedGuide } from '../../services/guideCache';

interface DetailData {
  settings: Partial<Settings>;
  guide: GuideDetail | null;
  loading: boolean;
  statusBarHeight: number;
  navBarHeight: number;
  trustPoints: TrustPoint[];
  serviceScope: string[];
  bookingArrangement: string[];
  heroSubtitle: string;
  avatarLoaded: boolean;
  reviewList: ProcessedReview[];
  reviewTotal: number;
  reviewScore: string;
  showAllReviews: boolean;
}

interface DetailCustom {
  _allReviews: ProcessedReview[];
  _initNavHeight(): void;
  _applyGuide(guide: GuideDetail, settings: Partial<Settings>): void;
  loadGuide(id: string): Promise<void>;
  buildHeroSubtitle(guide: GuideDetail): string;
  buildTrustPoints(guide: GuideDetail): TrustPoint[];
  buildServiceScope(): string[];
  buildBookingArrangement(guide: GuideDetail): string[];
  buildReviews(rawReviews: Review[]): ProcessedReview[];
  calcReviewScore(reviews: ProcessedReview[]): string;
  onToggleReviews(): void;
  onAvatarLoad(): void;
  onBack(): void;
  onPhoneCall(): void;
}

Page<DetailData, DetailCustom>({
  _allReviews: [],

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

  onLoad(options: Record<string, string | undefined>) {
    const { id } = options;
    this._initNavHeight();
    try {
      const cached = wx.getStorageSync('settings');
      if (cached) this.setData({ settings: cached });
    } catch (_e) {
      /* ignore */
    }
    if (!id) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      return;
    }
    this.loadGuide(id);
  },

  _initNavHeight() {
    try {
      const { statusBarHeight } = wx.getWindowInfo();
      const menuButton = wx.getMenuButtonBoundingClientRect();
      const navBarHeight = (menuButton.top - statusBarHeight) * 2 + menuButton.height;
      this.setData({ statusBarHeight, navBarHeight });
    } catch (_e) {
      // 获取失败时使用默认值
    }
  },

  _applyGuide(guide: GuideDetail, settings: Partial<Settings>) {
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
    resolveAvatars([guide]).then(([resolved]) => this.setData({ 'guide.avatar': resolved.avatar }));
  },

  async loadGuide(id: string) {
    const cached = getCachedGuide(id);
    if (cached) {
      this._applyGuide(cached, this.data.settings);
    } else if (!this.data.guide) {
      this.setData({ loading: true });
    }

    try {
      const [guideRes, settingsRes] = await Promise.all([getGuideDetail(id), getSettings()]);
      const guide = guideRes.data as GuideDetail;
      const settings = (settingsRes.data || {}) as Settings;
      if (!guide || guide.status === false) {
        wx.showToast({ title: '导游不存在', icon: 'none' });
        wx.navigateBack();
        return;
      }
      this._applyGuide(guide, settings);
    } catch (e) {
      console.error('加载导游详情失败', e);
      if (!this.data.guide) {
        this.setData({ loading: false });
        wx.showToast({ title: '加载失败，请重试', icon: 'none' });
      }
    }
  },

  buildHeroSubtitle(guide: GuideDetail): string {
    return `${guide.licenseText || '本地持证导游'}，平台统一协调安排`;
  },

  buildTrustPoints(guide: GuideDetail): TrustPoint[] {
    return [
      { label: '从业经验', value: `${guide.experienceYear}年` },
      { label: '累计服务', value: `${guide.serviceCount}+游客` },
    ];
  },

  buildServiceScope(): string[] {
    return ['五台山景区内专业讲解与规划', '接站、包车等出行协助沟通'];
  },

  buildBookingArrangement(guide: GuideDetail): string[] {
    const items = [
      '具体接待导游将根据出行日期、人数、路线和实际档期协调安排。',
      '节假日、初一十五和暑期客流较大，建议尽早确认出发时间与行程需求。',
      '如需接站、包车服务，请在咨询时一并说明，方便统一衔接安排。',
    ];
    return guide.phone ? items.slice(0, 3) : items.slice(0, 2);
  },

  buildReviews(rawReviews: Review[]): ProcessedReview[] {
    return rawReviews.map((r) => ({
      ...r,
      stars: Array.from({ length: 5 }, (_, i) => (i < r.rating ? '★' : '☆')),
    }));
  },

  calcReviewScore(reviews: ProcessedReview[]): string {
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
