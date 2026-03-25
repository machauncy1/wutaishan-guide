import { useEffect, useState } from 'react';
import { getMyAvailability, setAvailability } from '../services/availService';
import type { DayStatus } from '../services/availService';
import { logout } from '../services/authService';
import StatusTag from '../components/StatusTag';
import ActionSheet from '../components/ActionSheet';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00+08:00');
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekday = WEEKDAYS[d.getDay()];
  return { display: `${month}/${day}`, weekday: `周${weekday}` };
}

function getWeekLabel(dateStr: string, todayStr: string): string {
  const d = new Date(dateStr + 'T00:00:00+08:00');
  const t = new Date(todayStr + 'T00:00:00+08:00');
  const diff = Math.floor((d.getTime() - t.getTime()) / 86400000);
  const todayDay = t.getDay() || 7; // 周日=7
  const daysToEndOfWeek = 7 - todayDay;
  if (diff <= daysToEndOfWeek) return '本周';
  if (diff <= daysToEndOfWeek + 7) return '下周';
  const weekNum = Math.ceil((diff - daysToEndOfWeek) / 7);
  return `第${weekNum + 1}周`;
}

const guideActions = [
  { label: '未派', value: 'free' },
  { label: '请假', value: 'leave' },
  { label: '上午已派', value: 'morning' },
  { label: '下午已派', value: 'afternoon' },
  { label: '全天已派', value: 'allday' },
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

  const todayStr = days[0]?.date || '';

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
          <div className="space-y-2">
            {days.map((day, i) => {
              const { display, weekday } = formatDate(day.date);
              const weekLabel = getWeekLabel(day.date, todayStr);
              const prevWeekLabel = i > 0 ? getWeekLabel(days[i - 1].date, todayStr) : '';
              const showWeekHeader = weekLabel !== prevWeekLabel;

              return (
                <div key={day.date}>
                  {showWeekHeader && (
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wide pt-3 pb-1 px-1">
                      {weekLabel}
                    </div>
                  )}
                  <div
                    className="flex items-center justify-between bg-white rounded-xl px-4 py-3.5 shadow-sm active:bg-gray-50"
                    onClick={() => setSelectedDate(day.date)}
                  >
                    <div>
                      <span className="text-base font-medium text-gray-800">{display}</span>
                      <span className="ml-2 text-sm text-gray-400">{weekday}</span>
                    </div>
                    <StatusTag status={day.status} />
                  </div>
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
        currentValue={days.find((d) => d.date === selectedDate)?.status}
        onSelect={handleSelect}
        onClose={() => setSelectedDate(null)}
      />
    </div>
  );
}
