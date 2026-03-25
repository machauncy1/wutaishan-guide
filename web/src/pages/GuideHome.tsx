import { useEffect, useState } from 'react';
import { getMyAvailability, setAvailability } from '../services/availService';
import { logout } from '../services/authService';
import StatusTag from '../components/StatusTag';
import ActionSheet from '../components/ActionSheet';

interface DayStatus {
  date: string;
  status: AvailabilityStatus;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00+08:00');
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekday = WEEKDAYS[d.getDay()];
  return { display: `${month}/${day}`, weekday: `周${weekday}` };
}

const guideActions = [
  { label: '设为可接', value: 'available' },
  { label: '设为不可接', value: 'unavailable' },
];

export default function GuideHome() {
  const [days, setDays] = useState<DayStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const name = localStorage.getItem('avail_name') || '导游';

  async function fetchData() {
    setLoading(true);
    try {
      const res = await getMyAvailability();
      if (res.success && res.data) {
        setDays(res.data);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleSelect(status: string) {
    if (!selectedDate) return;
    await setAvailability(selectedDate, status as AvailabilityStatus);
    setSelectedDate(null);
    fetchData();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-600 text-white px-4 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">我的可用时间</h1>
        <button onClick={logout} className="text-sm text-indigo-200 active:text-white">
          {name} | 退出
        </button>
      </div>

      {/* List */}
      <div className="p-4">
        {loading ? (
          <p className="text-center text-gray-400 py-8">加载中...</p>
        ) : (
          <div className="space-y-3">
            {days.map((day) => {
              const { display, weekday } = formatDate(day.date);
              return (
                <div
                  key={day.date}
                  className="flex items-center justify-between bg-white rounded-xl px-4 py-3.5 shadow-sm active:bg-gray-50"
                  onClick={() => setSelectedDate(day.date)}
                >
                  <div>
                    <span className="text-base font-medium text-gray-800">{display}</span>
                    <span className="ml-2 text-sm text-gray-400">{weekday}</span>
                  </div>
                  <StatusTag status={day.status} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ActionSheet
        visible={!!selectedDate}
        title={selectedDate ? `设置 ${selectedDate} 状态` : ''}
        actions={guideActions}
        onSelect={handleSelect}
        onClose={() => setSelectedDate(null)}
      />
    </div>
  );
}
