import { getNavBarInfo, getCachedSettings } from '../../services/appService';

interface BookingForm {
  touristName: string;
  touristPhone: string;
  date: string;
  timePeriod: TimePeriod | '';
  groupSize: number;
  remark: string;
}

interface BookingErrors {
  touristName: string;
  touristPhone: string;
  date: string;
  timePeriod: string;
  groupSize: string;
}

interface BookingData {
  statusBarHeight: number;
  navBarHeight: number;
  guideId: string;
  guideName: string;
  today: string;
  timePeriodOptions: TimePeriod[];
  form: BookingForm;
  errors: BookingErrors;
  submitting: boolean;
  serviceTotal: number;
}

interface BookingCustom {
  _validate(): boolean;
  onInputName(e: WechatMiniprogram.Input): void;
  onInputPhone(e: WechatMiniprogram.Input): void;
  onDateChange(e: WechatMiniprogram.PickerChange): void;
  onSelectPeriod(e: WechatMiniprogram.TouchEvent): void;
  onGroupMinus(): void;
  onGroupPlus(): void;
  onInputRemark(e: WechatMiniprogram.Input): void;
  onSubmit(): void;
  onBack(): void;
}

const PHONE_RE = /^1[3-9]\d{9}$/;

/** 获取北京时间今天日期，与云函数保持一致 */
function getToday(): string {
  const now = new Date();
  const bjTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return bjTime.toISOString().slice(0, 10);
}

function emptyErrors(): BookingErrors {
  return { touristName: '', touristPhone: '', date: '', timePeriod: '', groupSize: '' };
}

Page<BookingData, BookingCustom>({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    guideId: '',
    guideName: '',
    today: '',
    timePeriodOptions: ['上午', '下午'],
    form: {
      touristName: '',
      touristPhone: '',
      date: '',
      timePeriod: '' as TimePeriod | '',
      groupSize: 1,
      remark: '',
    },
    errors: {
      touristName: '',
      touristPhone: '',
      date: '',
      timePeriod: '',
      groupSize: '',
    },
    submitting: false,
    serviceTotal: 21300,
  },

  onLoad(options: Record<string, string | undefined>) {
    const { guideId, guideName } = options;
    if (!guideId || !guideName) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      return;
    }
    const cached = getCachedSettings();
    this.setData({
      ...getNavBarInfo(),
      guideId,
      guideName: decodeURIComponent(guideName),
      today: getToday(),
      serviceTotal: cached.serviceTotal || 21300,
    });
  },

  // ===== 输入事件 =====

  onInputName(e: WechatMiniprogram.Input) {
    this.setData({ 'form.touristName': e.detail.value, 'errors.touristName': '' });
  },

  onInputPhone(e: WechatMiniprogram.Input) {
    this.setData({ 'form.touristPhone': e.detail.value, 'errors.touristPhone': '' });
  },

  onDateChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ 'form.date': e.detail.value as string, 'errors.date': '' });
  },

  onSelectPeriod(e: WechatMiniprogram.TouchEvent) {
    const value = e.currentTarget.dataset.value as TimePeriod;
    this.setData({ 'form.timePeriod': value, 'errors.timePeriod': '' });
  },

  onGroupMinus() {
    if (this.data.form.groupSize > 1) {
      this.setData({ 'form.groupSize': this.data.form.groupSize - 1 });
    }
  },

  onGroupPlus() {
    if (this.data.form.groupSize < 20) {
      this.setData({ 'form.groupSize': this.data.form.groupSize + 1 });
    }
  },

  onInputRemark(e: WechatMiniprogram.Input) {
    this.setData({ 'form.remark': e.detail.value });
  },

  // ===== 校验 =====

  _validate(): boolean {
    const { form } = this.data;
    const errors = emptyErrors();
    let valid = true;

    if (!form.touristPhone) {
      errors.touristPhone = '请填写手机号';
      valid = false;
    } else if (!PHONE_RE.test(form.touristPhone)) {
      errors.touristPhone = '请输入正确的手机号';
      valid = false;
    }
    if (!form.date) {
      errors.date = '请选择预约日期';
      valid = false;
    }
    if (!form.timePeriod) {
      errors.timePeriod = '请选择预约时段';
      valid = false;
    }

    this.setData({ errors });
    return valid;
  },

  // ===== 提交 =====

  async onSubmit() {
    if (this.data.submitting) return;
    if (!this._validate()) return;

    this.setData({ submitting: true });

    const { form, guideId, guideName } = this.data;
    try {
      const res = await wx.cloud.callFunction({
        name: 'createBooking',
        data: {
          guideId,
          guideName,
          touristName: form.touristName.trim(),
          touristPhone: form.touristPhone,
          date: form.date,
          timePeriod: form.timePeriod,
          groupSize: form.groupSize,
          remark: form.remark.trim(),
        },
      });
      const result = res.result as { success: boolean; errMsg?: string };
      if (result.success) {
        wx.redirectTo({
          url: `/pages/bookingSuccess/index?guideId=${guideId}&date=${form.date}&timePeriod=${form.timePeriod}&groupSize=${form.groupSize}`,
        });
      } else {
        wx.showToast({ title: result.errMsg || '提交失败', icon: 'none' });
      }
    } catch (_e) {
      wx.showToast({ title: '网络异常，请重试', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },

  onBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
      return;
    }
    wx.reLaunch({ url: '/pages/index/index' });
  },
});
