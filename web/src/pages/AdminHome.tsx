import { useEffect, useState } from 'react';
import { getDailyGuides, updateGuideStatus } from '../services/availService';
import { logout } from '../services/authService';
import StatusTag from '../components/StatusTag';
import ActionSheet from '../components/ActionSheet';

interface GuideDay {
  userId: string;
  guideId: string;
  name: string;
  phone: string;
  status: AvailabilityStatus;
}

function getTodayStr() {
  const now = new Date();
  const bjOffset = 8 * 60 * 60 * 1000;
  return new Date(now.getTime() + bjOffset).toISOString().slice(0, 10);
}

function getDateOffset(days: number) {
  const now = new Date();
  const bjOffset = 8 * 60 * 60 * 1000;
  return new Date(now.getTime() + bjOffset + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

const quickDates = [
  { label: '今天', offset: 0 },
  { label: '明天', offset: 1 },
  { label: '后天', offset: 2 },
];

const adminActions = [
  { label: '设为可接', value: 'available' },
  { label: '设为不可接', value: 'unavailable' },
  { label: '标记已派', value: 'assigned' },
];

export default function AdminHome() {
  const [date, setDate] = useState(getTodayStr);
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
        setGuides(res.data);
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
  const available = guides.filter((g) => g.status === 'available').length;
  const assigned = guides.filter((g) => g.status === 'assigned').length;

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
            const d = getDateOffset(qd.offset);
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
        <span className="text-green-600">可接 {available}</span>
        <span className="text-blue-600">已派 {assigned}</span>
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
        onSelect={handleSelect}
        onClose={() => setSelectedGuide(null)}
      />
    </div>
  );
}
