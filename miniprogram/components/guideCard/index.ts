Component({
  properties: {
    guide: {
      type: Object,
      value: {} as GuideListItem,
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
