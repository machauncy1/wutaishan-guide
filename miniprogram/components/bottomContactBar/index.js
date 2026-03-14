// components/bottomContactBar/index.js
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
  },
});
