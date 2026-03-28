import { request } from '../api/client';

export interface DayStatus {
  date: string;
  status: AvailabilityStatus;
  source?: string;
}

export interface GuideDay {
  userId: string;
  guideId: string;
  name: string;
  phone: string;
  status: AvailabilityStatus;
  source?: string;
}

export async function getMyAvailability() {
  return request<DayStatus[]>('GET', '/my-availability');
}

export async function setAvailability(date: string, status: AvailabilityStatus, source?: string) {
  return request('POST', '/set-availability', { date, status, source });
}

export async function getDailyGuides(date: string) {
  return request<GuideDay[]>('GET', '/daily-guides', { date });
}

export async function updateGuideStatus(
  guideId: string,
  date: string,
  status: AvailabilityStatus,
  source?: string,
) {
  return request('POST', '/update-status', { guideId, date, status, source });
}

export async function getSourceOptions() {
  return request<string[]>('GET', '/source-options');
}
