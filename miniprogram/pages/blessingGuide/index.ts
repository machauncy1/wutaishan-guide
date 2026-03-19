import { getNavBarInfo, getCachedSettings, fetchRemoteSettings } from '../../services/appService';

Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    activeIndex: -1,
    contactPhone: '',
    bannerImage: '',
    bannerLoaded: false,
  },

  onLoad() {
    const cached = getCachedSettings();
    this.setData({
      ...getNavBarInfo(),
      contactPhone: cached.contactPhone || '',
      bannerImage: cached.bannerImage || '',
    });

    fetchRemoteSettings()
      .then((s) => {
        this.setData({
          contactPhone: s.contactPhone || '',
          bannerImage: s.bannerImage || '',
        });
      })
      .catch(() => {});
  },

  onBannerLoad() {
    this.setData({ bannerLoaded: true });
  },

  onFaqTap(e: WechatMiniprogram.TouchEvent) {
    const index = Number(e.currentTarget.dataset.index);
    this.setData({ activeIndex: this.data.activeIndex === index ? -1 : index });
  },

  onBack() {
    wx.navigateBack();
  },
});
