import { request } from '../api/client';
import { FREE_PERIOD } from '../constants/availability';

/** 兼容旧后端返回的数据格式（后端未更新时） */

function normalizeDayData<T>(raw: T): T {
  const r = raw as any;
  if (r.dayStatus !== undefined) {
    r.morning = r.morning || FREE_PERIOD;
    r.afternoon = r.afternoon || FREE_PERIOD;
    return r;
  }
  // 旧格式兼容
  const source = r.source || undefined;
  r.dayStatus = 'free';
  r.morning = FREE_PERIOD;
  r.afternoon = FREE_PERIOD;
  switch (r.status) {
    case 'leave':
      r.dayStatus = 'leave';
      break;
    case 'morning':
      r.morning = { status: 'dispatched', source };
      break;
    case 'afternoon':
      r.afternoon = { status: 'dispatched', source };
      break;
    case 'allday':
      r.morning = { status: 'dispatched', source };
      r.afternoon = { status: 'dispatched', source };
      break;
  }
  return r;
}

export interface DayAvailability {
  date: string;
  dayStatus: DayStatus;
  morning: PeriodInfo;
  afternoon: PeriodInfo;
}

export interface GuideDay {
  userId: string;
  guideId: string;
  name: string;
  phone: string;
  dayStatus: DayStatus;
  morning: PeriodInfo;
  afternoon: PeriodInfo;
}

export interface SetAvailabilityParams {
  date: string;
  dayStatus?: DayStatus;
  morning?: PeriodInfo;
  afternoon?: PeriodInfo;
}

export interface UpdateGuideStatusParams extends SetAvailabilityParams {
  guideId: string;
}

export async function getMyAvailability() {
  const res = await request<DayAvailability[]>('GET', '/my-availability');
  if (res.success && res.data) {
    res.data = res.data.map(normalizeDayData);
  }
  return res;
}

export async function setAvailability(params: SetAvailabilityParams) {
  return request('POST', '/set-availability', { ...params } as Record<string, unknown>);
}

export async function getDailyGuides(date: string) {
  const res = await request<GuideDay[]>('GET', '/daily-guides', { date });
  if (res.success && res.data) {
    res.data = res.data.map(normalizeDayData);
  }
  return res;
}

export async function updateGuideStatus(params: UpdateGuideStatusParams) {
  return request('POST', '/update-status', { ...params } as Record<string, unknown>);
}

export async function getSourceOptions() {
  return request<string[]>('GET', '/source-options');
}
