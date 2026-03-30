function PeriodTag({
  label,
  source,
  className,
}: {
  label: string;
  source?: string;
  className: string;
}) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
      {source && <span className="opacity-60 font-normal"> · {source}</span>}
    </span>
  );
}

export default function StatusTag({
  dayStatus,
  morning,
  afternoon,
}: {
  dayStatus: DayStatus;
  morning: PeriodInfo;
  afternoon: PeriodInfo;
}) {
  if (dayStatus === 'leave') {
    return (
      <span className="inline-block rounded-full px-3 py-1 text-sm font-medium bg-gray-100 text-gray-500">
        请假
      </span>
    );
  }

  const morningDispatched = morning?.status === 'dispatched';
  const afternoonDispatched = afternoon?.status === 'dispatched';

  // 全天未派
  if (!morningDispatched && !afternoonDispatched) {
    return (
      <span className="inline-block rounded-full px-3 py-1 text-sm font-medium bg-green-100 text-green-700">
        未派
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      {morningDispatched && (
        <PeriodTag label="上午" source={morning.source} className="bg-blue-100 text-blue-700" />
      )}
      {afternoonDispatched && (
        <PeriodTag
          label="下午"
          source={afternoon.source}
          className="bg-purple-100 text-purple-700"
        />
      )}
    </span>
  );
}
