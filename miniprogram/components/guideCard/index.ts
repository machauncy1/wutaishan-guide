Component({
  properties: {
    guide: {
      type: Object,
      value: {} as IGuideListItem,
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
