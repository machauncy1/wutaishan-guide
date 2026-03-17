interface SuccessData {
  guideId: string;
  date: string;
  timePeriod: string;
  groupSize: string;
  contactPhone: string;
}

interface SuccessCustom {
  onPhoneCall(): void;
  onBackDetail(): void;
  onBackHome(): void;
}

Page<SuccessData, SuccessCustom>({
  data: {
    guideId: '',
    date: '',
    timePeriod: '',
    groupSize: '',
    contactPhone: '',
  },

  onLoad(options: Record<string, string | undefined>) {
    this.setData({
      guideId: options.guideId || '',
      date: options.date || '',
      timePeriod: options.timePeriod || '',
      groupSize: options.groupSize || '',
    });

    try {
      const settings = wx.getStorageSync('settings');
      if (settings && settings.contactPhone) {
        this.setData({ contactPhone: settings.contactPhone });
      }
    } catch (_e) {
      /* ignore */
    }
  },

  onPhoneCall() {
    const phone = this.data.contactPhone;
    if (!phone) return;
    wx.makePhoneCall({ phoneNumber: phone });
  },

  onBackDetail() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
      return;
    }
    const { guideId } = this.data;
    if (guideId) {
      wx.redirectTo({ url: `/pages/guideDetail/index?id=${guideId}` });
    } else {
      wx.reLaunch({ url: '/pages/index/index' });
    }
  },

  onBackHome() {
    wx.reLaunch({ url: '/pages/index/index' });
  },
});
