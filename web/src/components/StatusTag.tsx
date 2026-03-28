const statusConfig: Record<AvailabilityStatus, { label: string; className: string }> = {
  free: { label: '未派', className: 'bg-green-100 text-green-700' },
  leave: { label: '请假', className: 'bg-gray-100 text-gray-500' },
  morning: { label: '上午已派', className: 'bg-blue-100 text-blue-700' },
  afternoon: { label: '下午已派', className: 'bg-purple-100 text-purple-700' },
  allday: { label: '全天已派', className: 'bg-orange-100 text-orange-700' },
};

export default function StatusTag({
  status,
  source,
}: {
  status: AvailabilityStatus;
  source?: string | null;
}) {
  const config = statusConfig[status] || statusConfig.free;
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${config.className}`}>
      {config.label}
      {source && <span className="opacity-60 font-normal"> · {source}</span>}
    </span>
  );
}
