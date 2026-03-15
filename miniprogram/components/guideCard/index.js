// components/guideCard/index.js
Component({
  properties: {
    guide: {
      type: Object,
      value: {},
    },
  },
  data: {
    avatarLoaded: false,
  },
  methods: {
    onAvatarLoad() {
      this.setData({ avatarLoaded: true });
    },
  },
});
