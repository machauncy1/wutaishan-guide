import { request } from '../api/client';

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
  return request<DayAvailability[]>('GET', '/my-availability');
}

export async function setAvailability(params: SetAvailabilityParams) {
  return request('POST', '/set-availability', { ...params } as Record<string, unknown>);
}

export async function getDailyGuides(date: string) {
  return request<GuideDay[]>('GET', '/daily-guides', { date });
}

export async function updateGuideStatus(params: UpdateGuideStatusParams) {
  return request('POST', '/update-status', { ...params } as Record<string, unknown>);
}

export async function getSourceOptions() {
  return request<string[]>('GET', '/source-options');
}
