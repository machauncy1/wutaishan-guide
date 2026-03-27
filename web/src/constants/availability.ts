import type { Action } from '../components/ActionSheet';

export const DISPATCHED_STATUSES: AvailabilityStatus[] = ['morning', 'afternoon', 'allday'];

export const sourceActions: Action[] = [
  { label: '携程', value: 'ctrip' },
  { label: '平台', value: 'platform' },
  { label: '其他', value: 'other' },
];

export function needsSource(value: string) {
  return DISPATCHED_STATUSES.includes(value as AvailabilityStatus);
}
