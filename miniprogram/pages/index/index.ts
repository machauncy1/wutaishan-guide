import { getGuideList } from '../../services/guideDb';
import { resolveAvatars } from '../../services/cloudFile';
import { prefetchGuide } from '../../services/guideCache';
import { getNavBarInfo, getCachedSettings, fetchRemoteSettings } from '../../services/appService';

const REFRESH_INTERVAL = 30 * 1000; // onShow 最短刷新间隔

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
  _lastLoadTime: number;
  _loadFromCache(): void;
  loadData(): Promise<void>;
  _observeGuideCards(guideList: GuideListItem[]): void;
  onEntryTap(e: WechatMiniprogram.TouchEvent): void;
  onGuideTap(e: WechatMiniprogram.TouchEvent): void;
  onBannerLoad(): void;
  onPhoneCall(): void;
}

Page<IndexData, IndexCustom>({
  _lastLoadTime: 0,

  data: {
    settings: {},
    guideList: [],
    loading: true,
    bannerLoaded: false,
    statusBarHeight: 20,
    navBarHeight: 44,
  },

  onLoad() {
    this.setData(getNavBarInfo());
    this._loadFromCache();
    this.loadData();
  },

  onShow() {
    if (Date.now() - this._lastLoadTime > REFRESH_INTERVAL) {
      this.loadData();
    }
  },

  _loadFromCache() {
    const settings = getCachedSettings();
    let guideList: GuideListItem[] = [];
    try {
      guideList = wx.getStorageSync('guideList') || [];
    } catch (_e) {
      /* ignore */
    }
    if (Object.keys(settings).length || guideList.length) {
      this.setData({ settings, guideList, loading: false });
    }
  },

  async loadData() {
    this._lastLoadTime = Date.now();
    if (!this.data.guideList.length) {
      this.setData({ loading: true });
    }
    try {
      const [settings, guidesRes] = await Promise.all([fetchRemoteSettings(), getGuideList()]);
      const guideList = (guidesRes.data || []) as GuideListItem[];

      try {
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
