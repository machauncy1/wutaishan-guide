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
  const [showCalendar, setShowCalendar] = useState(false);
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

  // 前 7 天列表展示，其余通过日历设置
  const recentDays = days.slice(0, 7);
  const laterDays = days.slice(7);

  // 日历中有非 free 状态的天数
  const laterSetCount = laterDays.filter((d) => d.status !== 'free').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-600 text-white px-4 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">我的可用时间</h1>
        <button onClick={logout} className="text-sm text-indigo-200 active:text-white">
          {name} | 退出
        </button>
      </div>

      {/* 近 7 天列表 */}
      <div className="p-4">
        <div className="text-xs font-medium text-gray-400 tracking-wide pb-2 px-1">近 7 天</div>
        {loading ? (
          <p className="text-center text-gray-400 py-8">加载中...</p>
        ) : (
          <div className="space-y-2">
            {recentDays.map((day) => {
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

      {/* 更远日期入口 */}
      {laterDays.length > 0 && (
        <div className="px-4 pb-4">
          <button
            className="w-full py-3 rounded-xl bg-white shadow-sm text-center text-sm text-gray-600 active:bg-gray-50"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            {showCalendar ? '收起' : '设置更远日期'}
            {!showCalendar && laterSetCount > 0 && (
              <span className="ml-1 text-indigo-500">（已设 {laterSetCount} 天）</span>
            )}
          </button>

          {showCalendar && (
            <div className="mt-3 space-y-2">
              {laterDays.map((day) => {
                const { display, weekday } = formatDate(day.date);
                return (
                  <div
                    key={day.date}
                    className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm active:bg-gray-50"
                    onClick={() => setSelectedDate(day.date)}
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-700">{display}</span>
                      <span className="ml-2 text-xs text-gray-400">{weekday}</span>
                    </div>
                    <StatusTag status={day.status} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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
