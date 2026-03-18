import { getNavBarInfo, getCachedContactPhone, fetchContactPhone } from '../../services/guidePage';

Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    activeIndex: -1,
    contactPhone: '',
  },

  onLoad() {
    this.setData(getNavBarInfo());

    const cached = getCachedContactPhone();
    if (cached) this.setData({ contactPhone: cached });

    fetchContactPhone()
      .then((phone) => {
        if (phone) this.setData({ contactPhone: phone });
      })
      .catch(() => {});
  },

  onFaqTap(e: WechatMiniprogram.TouchEvent) {
    const index = Number(e.currentTarget.dataset.index);
    this.setData({ activeIndex: this.data.activeIndex === index ? -1 : index });
  },

  onBack() {
    wx.navigateBack();
  },
});
