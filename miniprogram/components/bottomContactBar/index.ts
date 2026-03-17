Component({
  properties: {
    phone: {
      type: String,
      value: '',
    },
    showConsult: {
      type: Boolean,
      value: true,
    },
    showBooking: {
      type: Boolean,
      value: false,
    },
    subtitle: {
      type: String,
      value: '',
    },
    consultLabel: {
      type: String,
      value: '在线咨询',
    },
    phoneLabel: {
      type: String,
      value: '电话联系',
    },
  },

  methods: {
    onPhoneCall() {
      const phone = this.properties.phone;
      if (!phone) {
        wx.showToast({ title: '暂无联系电话', icon: 'none' });
        return;
      }
      wx.makePhoneCall({ phoneNumber: phone });
    },

    onConsultSheet() {
      const hasConsult = this.properties.showConsult;
      if (!hasConsult) {
        // 没有微信咨询，直接打电话
        this.onPhoneCall();
        return;
      }
      wx.showActionSheet({
        itemList: ['电话沟通', '微信咨询'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.onPhoneCall();
          } else if (res.tapIndex === 1) {
            this.triggerEvent('consult');
          }
        },
      });
    },

    onBooking() {
      this.triggerEvent('booking');
    },
  },
});
