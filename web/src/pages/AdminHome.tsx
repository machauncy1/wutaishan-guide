import { useEffect, useState } from 'react';
import { getDailyGuides, updateGuideStatus } from '../services/availService';
import { logout } from '../services/authService';
import { todayBJ, offsetDateBJ } from '../utils/date';
import StatusTag from '../components/StatusTag';
import ActionSheet from '../components/ActionSheet';
import type { GuideDay } from '../services/availService';

const quickDates = [
  { label: '今天', offset: 0 },
  { label: '明天', offset: 1 },
  { label: '后天', offset: 2 },
];

const STATUS_ORDER: Record<string, number> = {
  free: 0,
  morning: 0,
  afternoon: 0,
  allday: 1,
  leave: 2,
};

const adminActions = [
  { label: '未派', value: 'free' },
  { label: '请假', value: 'leave' },
  { label: '上午已派', value: 'morning' },
  { label: '下午已派', value: 'afternoon' },
  { label: '全天已派', value: 'allday' },
];

export default function AdminHome() {
  const [date, setDate] = useState(todayBJ);
  const [guides, setGuides] = useState<GuideDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuide, setSelectedGuide] = useState<GuideDay | null>(null);
  const [customDate, setCustomDate] = useState(false);
  const name = localStorage.getItem('avail_name') || '管理员';

  async function fetchData(d: string) {
    setLoading(true);
    try {
      const res = await getDailyGuides(d);
      if (res.success && res.data) {
        const sorted = [...res.data].sort(
          (a, b) => (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99),
        );
        setGuides(sorted);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData(date);
  }, [date]);

  async function handleSelect(status: string) {
    if (!selectedGuide) return;
    await updateGuideStatus(selectedGuide.guideId, date, status as AvailabilityStatus);
    setSelectedGuide(null);
    fetchData(date);
  }

  // Count stats
  const free = guides.filter((g) => g.status === 'free').length;
  const assigned = guides.filter((g) =>
    ['morning', 'afternoon', 'allday'].includes(g.status),
  ).length;
  const leave = guides.filter((g) => g.status === 'leave').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-600 text-white px-4 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">导游可用总览</h1>
        <button onClick={logout} className="text-sm text-indigo-200 active:text-white">
          {name} | 退出
        </button>
      </div>

      {/* Date selector */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex gap-2">
          {quickDates.map((qd) => {
            const d = offsetDateBJ(qd.offset);
            return (
              <button
                key={qd.offset}
                onClick={() => {
                  setDate(d);
                  setCustomDate(false);
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                  date === d && !customDate
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {qd.label}
              </button>
            );
          })}
          <button
            onClick={() => setCustomDate(true)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${
              customDate
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            自选
          </button>
        </div>

        {customDate && (
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
          />
        )}
      </div>

      {/* Stats */}
      <div className="px-4 py-2 flex gap-4 text-sm text-gray-500">
        <span>共 {guides.length} 人</span>
        <span className="text-green-600">未派 {free}</span>
        <span className="text-blue-600">已派 {assigned}</span>
        <span className="text-gray-400">请假 {leave}</span>
      </div>

      {/* Guide list */}
      <div className="px-4 pb-4">
        {loading ? (
          <p className="text-center text-gray-400 py-8">加载中...</p>
        ) : guides.length === 0 ? (
          <p className="text-center text-gray-400 py-8">暂无导游数据</p>
        ) : (
          <div className="space-y-3">
            {guides.map((guide) => (
              <div
                key={guide.guideId}
                className="flex items-center justify-between bg-white rounded-xl px-4 py-3.5 shadow-sm active:bg-gray-50"
                onClick={() => setSelectedGuide(guide)}
              >
                <div>
                  <span className="text-base font-medium text-gray-800">{guide.name}</span>
                  <span className="ml-2 text-xs text-gray-400">{guide.phone}</span>
                </div>
                <StatusTag status={guide.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      <ActionSheet
        visible={!!selectedGuide}
        title={selectedGuide ? `${selectedGuide.name} - ${date}` : ''}
        actions={adminActions}
        currentValue={selectedGuide?.status}
        onSelect={handleSelect}
        onClose={() => setSelectedGuide(null)}
      />
    </div>
  );
}
