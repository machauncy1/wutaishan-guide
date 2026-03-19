import {
  getNavBarInfo,
  getCachedContactPhone,
  fetchContactPhone,
  getCachedBannerImage,
  fetchBannerImage,
} from '../../services/guidePage';

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
    this.setData(getNavBarInfo());

    const cached = getCachedContactPhone();
    if (cached) this.setData({ contactPhone: cached });

    const cachedBanner = getCachedBannerImage();
    if (cachedBanner) this.setData({ bannerImage: cachedBanner });

    fetchContactPhone()
      .then((phone) => {
        if (phone) this.setData({ contactPhone: phone });
      })
      .catch(() => {});

    fetchBannerImage()
      .then((url) => {
        if (url) this.setData({ bannerImage: url });
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
