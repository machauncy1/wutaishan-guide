import { getGuideList } from '../../services/guide';
import { getSettings } from '../../services/settings';
import { resolveAvatars } from '../../services/cloudFile';
import { prefetchGuide } from '../../services/guideCache';

interface IndexData {
  settings: Partial<Settings>;
  guideList: GuideListItem[];
  loading: boolean;
  bannerLoaded: boolean;
  statusBarHeight: number;
  navBarHeight: number;
}

interface IndexCustom {
  _observer?: WechatMiniprogram.IntersectionObserver;
  _initNavHeight(): void;
  _loadFromCache(): void;
  loadData(): Promise<void>;
  _observeGuideCards(guideList: GuideListItem[]): void;
  onEntryTap(e: WechatMiniprogram.TouchEvent): void;
  onGuideTap(e: WechatMiniprogram.TouchEvent): void;
  onBannerLoad(): void;
  onPhoneCall(): void;
}

Page<IndexData, IndexCustom>({
  data: {
    settings: {},
    guideList: [],
    loading: true,
    bannerLoaded: false,
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
      const { statusBarHeight } = wx.getWindowInfo();
      const menuButton = wx.getMenuButtonBoundingClientRect();
      const navBarHeight = (menuButton.top - statusBarHeight) * 2 + menuButton.height;
      this.setData({ statusBarHeight, navBarHeight });
    } catch (_e) {
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
    } catch (_e) {
      /* ignore */
    }
  },

  async loadData() {
    if (!this.data.guideList.length) {
      this.setData({ loading: true });
    }
    try {
      const [settingsRes, guidesRes] = await Promise.all([getSettings(), getGuideList()]);
      const settings = (settingsRes.data || {}) as Settings;
      const guideList = (guidesRes.data || []) as GuideListItem[];

      try {
        wx.setStorageSync('settings', settings);
        wx.setStorageSync('guideList', guideList);
      } catch (_e) {
        /* ignore */
      }
      this.setData({ settings, guideList, loading: false });
      this._observeGuideCards(guideList);
      resolveAvatars(guideList).then((resolved) => this.setData({ guideList: resolved }));
    } catch (e) {
      console.error('加载数据失败', e);
      if (!this.data.guideList.length) {
        this.setData({ loading: false });
        wx.showToast({ title: '加载失败，请重试', icon: 'none' });
      }
    }
  },

  _observeGuideCards(guideList: GuideListItem[]) {
    if (this._observer) this._observer.disconnect();
    if (!guideList.length) return;

    try {
      const observer = this.createIntersectionObserver({ observeAll: true, nativeMode: true });
      observer.relativeToViewport({ bottom: 200 }).observe('.card-wrap', (res) => {
        if (res.intersectionRatio > 0) {
          const id = res.dataset && res.dataset.id;
          if (id) prefetchGuide(id);
        }
      });
      this._observer = observer;
    } catch (_e) {
      // 部分低版本基础库不支持 IntersectionObserver，静默降级
    }
  },

  onEntryTap(e: WechatMiniprogram.TouchEvent) {
    const { path } = e.currentTarget.dataset;
    if (!path) return;
    wx.navigateTo({
      url: path,
      fail() {
        wx.showToast({ title: '即将开放，敬请期待', icon: 'none' });
      },
    });
  },

  onGuideTap(e: WechatMiniprogram.TouchEvent) {
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
