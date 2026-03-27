import { request } from '../api/client';

export interface DayStatus {
  date: string;
  status: AvailabilityStatus;
  source?: BookingSource;
  sourceNote?: string;
}

export interface GuideDay {
  userId: string;
  guideId: string;
  name: string;
  phone: string;
  status: AvailabilityStatus;
  source?: BookingSource;
  sourceNote?: string;
}

export async function getMyAvailability() {
  return request<DayStatus[]>('GET', '/my-availability');
}

export async function setAvailability(
  date: string,
  status: AvailabilityStatus,
  source?: BookingSource,
  sourceNote?: string,
) {
  return request('POST', '/set-availability', { date, status, source, sourceNote });
}

export async function getDailyGuides(date: string) {
  return request<GuideDay[]>('GET', '/daily-guides', { date });
}

export async function updateGuideStatus(
  guideId: string,
  date: string,
  status: AvailabilityStatus,
  source?: BookingSource,
  sourceNote?: string,
) {
  return request('POST', '/update-status', { guideId, date, status, source, sourceNote });
}
