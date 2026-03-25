const statusConfig: Record<AvailabilityStatus, { label: string; className: string }> = {
  available: { label: '可接', className: 'bg-green-100 text-green-700' },
  unavailable: { label: '不可接', className: 'bg-gray-100 text-gray-500' },
  assigned: { label: '已派', className: 'bg-blue-100 text-blue-700' },
};

export default function StatusTag({ status }: { status: AvailabilityStatus }) {
  const config = statusConfig[status] || statusConfig.available;
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
