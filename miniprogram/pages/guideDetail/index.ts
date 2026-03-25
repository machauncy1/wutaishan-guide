import { getGuideDetail } from '../../services/guideDb';
import { resolveAvatars } from '../../services/cloudFile';
import { getCachedGuide } from '../../services/guideCache';
import { getNavBarInfo, getCachedSettings, fetchRemoteSettings } from '../../services/appService';

interface DetailData {
  settings: Partial<Settings>;
  guide: GuideDetail | null;
  loading: boolean;
  showContactOverlay: boolean;
  statusBarHeight: number;
  navBarHeight: number;
  trustPoints: TrustPoint[];
  serviceScope: string[];
  bookingArrangement: string[];
  faq: Array<{ q: string; a: string }>;
  heroSubtitle: string;
  avatarLoaded: boolean;
  reviewList: ProcessedReview[];
  reviewTotal: number;
  reviewScore: string;
  showAllReviews: boolean;
}

interface DetailCustom {
  _allReviews: ProcessedReview[];
  _applyGuide(guide: GuideDetail, settings: Partial<Settings>): void;
  loadGuide(id: string): Promise<void>;
  buildHeroSubtitle(guide: GuideDetail): string;
  buildTrustPoints(guide: GuideDetail): TrustPoint[];
  buildServiceScope(): string[];
  buildFAQ(): Array<{ q: string; a: string }>;
  buildBookingArrangement(): string[];
  buildReviews(rawReviews: Review[]): ProcessedReview[];
  calcReviewScore(reviews: ProcessedReview[]): string;
  onToggleReviews(): void;
  onAvatarLoad(): void;
  onBack(): void;
  onPhoneCall(): void;
  onConsult(): void;
  onCloseOverlay(): void;
  onContactSuccess(): void;
  onBooking(): void;
}

Page<DetailData, DetailCustom>({
  _allReviews: [],

  data: {
    settings: {},
    guide: null,
    loading: true,
    showContactOverlay: false,
    statusBarHeight: 20,
    navBarHeight: 44,
    trustPoints: [],
    serviceScope: [],
    bookingArrangement: [],
    faq: [],
    heroSubtitle: '',
    avatarLoaded: false,
    reviewList: [],
    reviewTotal: 0,
    reviewScore: '5.0',
    showAllReviews: false,
  },

  onLoad(options: Record<string, string | undefined>) {
    const { id } = options;
    const cached = getCachedSettings();
    this.setData({ ...getNavBarInfo(), settings: cached, loading: !!id });
    if (!id) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      return;
    }
    this.loadGuide(id);
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
      faq: this.buildFAQ(),
      bookingArrangement: this.buildBookingArrangement(),
      heroSubtitle: this.buildHeroSubtitle(guide),
      reviewList: this.data.showAllReviews ? allReviews : allReviews.slice(0, 3),
      reviewTotal: allReviews.length,
      reviewScore: this.calcReviewScore(allReviews),
    });
    resolveAvatars([guide]).then((list) => {
      if (list && list[0]) {
        this.setData({ 'guide.avatar': list[0].avatar });
      }
    });
  },

  async loadGuide(id: string) {
    const cached = getCachedGuide(id);
    if (cached) {
      this._applyGuide(cached, this.data.settings);
    } else if (!this.data.guide) {
      this.setData({ loading: true });
    }

    try {
      const [guideRes, settings] = await Promise.all([getGuideDetail(id), fetchRemoteSettings()]);
      const guide = guideRes.data as GuideDetail;
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
    return `五台山导游讲解服务 · ${guide.licenseText || '本地持证导游'}`;
  },

  buildTrustPoints(guide: GuideDetail): TrustPoint[] {
    return [
      { label: '从业经验', value: `${guide.experienceYear}年` },
      { label: '累计服务', value: `${guide.serviceCount}+游客` },
    ];
  },

  buildServiceScope(): string[] {
    return [
      '五台山导游讲解服务，支持五台山一日游、五台山深度游路线安排',
      '提供五台山接站、五台山包车、五台山接送站服务',
      '适合五台山自由行游客、首次来五台山游客，可根据需求定制行程',
    ];
  },

  buildFAQ(): Array<{ q: string; a: string }> {
    return [
      { q: '五台山导游多少钱？', a: '根据人数、时间和行程不同，一般为定制报价，咨询即可获取。' },
      {
        q: '五台山需要请导游吗？',
        a: '首次来或想深入了解佛教文化的游客更推荐，讲解体验完全不同。',
      },
      {
        q: '五台山一日游怎么安排？',
        a: '可根据时间定制经典路线或深度讲解路线，提前沟通效果更佳。',
      },
    ];
  },

  buildBookingArrangement(): string[] {
    const items = [
      '具体接待导游将根据出行日期、人数、路线和实际档期协调安排。',
      '节假日、初一十五和暑期客流较大，建议尽早确认出发时间与行程需求。',
      '如需接站、包车服务，请在咨询时一并说明，方便统一衔接安排。',
    ];
    return items;
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

  onConsult() {
    // 微信要求 open-type="contact" 必须由用户手动点击 <button> 触发
    // 弹出浮层，让用户点击真正的客服按钮
    this.setData({ showContactOverlay: true });
  },

  onCloseOverlay() {
    this.setData({ showContactOverlay: false });
  },

  onContactSuccess() {
    this.setData({ showContactOverlay: false });
  },

  onBooking() {
    const guide = this.data.guide;
    if (!guide || !guide._id) return;
    wx.navigateTo({
      url: `/pages/booking/index?guideId=${guide._id}&guideName=${encodeURIComponent(guide.name)}`,
    });
  },

  onPhoneCall() {
    const phone = this.data.settings.contactPhone;
    if (!phone) return;
    wx.makePhoneCall({ phoneNumber: phone });
  },
});
