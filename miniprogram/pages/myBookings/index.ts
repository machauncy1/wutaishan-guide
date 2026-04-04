import { getNavBarInfo } from '../../services/appService';

interface BookingItem {
  _id: string;
  guideId: string;
  guideName: string;
  touristName: string;
  touristPhone: string;
  date: string;
  timePeriod: string;
  groupSize: number;
  remark: string;
  createdAt: string;
}

interface BookingDisplayItem extends BookingItem {
  createdAtDisplay: string;
}

interface MyBookingsData {
  statusBarHeight: number;
  navBarHeight: number;
  loading: boolean;
  bookings: BookingDisplayItem[];
}

interface MyBookingsCustom {
  _loadBookings(): Promise<void>;
  onBack(): void;
  onGoHome(): void;
}

/** 格式化 ISO 时间为 "MM-DD HH:mm" */
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${mm}-${dd} ${hh}:${min}`;
}

Page<MyBookingsData, MyBookingsCustom>({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    loading: true,
    bookings: [],
  },

  onLoad() {
    this.setData(getNavBarInfo());
    this._loadBookings();
  },

  async _loadBookings() {
    this.setData({ loading: true });
    try {
      const res = await wx.cloud.callFunction({ name: 'getMyBookings' });
      const result = res.result as { success: boolean; bookings?: BookingItem[]; errMsg?: string };
      if (result.success && result.bookings) {
        const bookings = result.bookings.map((item) => ({
          ...item,
          createdAtDisplay: formatDate(item.createdAt),
        }));
        this.setData({ bookings });
      } else {
        wx.showToast({ title: result.errMsg || '加载失败', icon: 'none' });
      }
    } catch (_e) {
      wx.showToast({ title: '网络异常，请重试', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  onBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack({ delta: pages.length - 1 });
    } else {
      wx.reLaunch({ url: '/pages/index/index' });
    }
  },

  onGoHome() {
    wx.reLaunch({ url: '/pages/index/index' });
  },
});
