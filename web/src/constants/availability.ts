export const DISPATCHED_STATUSES: AvailabilityStatus[] = ['morning', 'afternoon', 'allday'];

export function needsSource(value: string) {
  return DISPATCHED_STATUSES.includes(value as AvailabilityStatus);
}
