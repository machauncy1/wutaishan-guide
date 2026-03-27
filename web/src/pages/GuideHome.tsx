import { useState } from 'react';
import { useMyAvailability, useSetAvailability } from '../hooks/useAvailability';
import { logout } from '../services/authService';
import { todayBJ, getLunarText, isLunarKeyDay, getShortDate, getWeekday } from '../utils/date';
import StatusTag from '../components/StatusTag';
import ActionSheet from '../components/ActionSheet';
import Loading from '../components/Loading';

const guideActions = [
  { label: '未派', value: 'free' },
  { label: '请假', value: 'leave' },
  { label: '上午已派', value: 'morning' },
  { label: '下午已派', value: 'afternoon' },
  { label: '全天已派', value: 'allday' },
];

export default function GuideHome() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const name = localStorage.getItem('avail_name') || '导游';
  const today = todayBJ();

  const { data: days = [], isLoading } = useMyAvailability();
  const setAvailMutation = useSetAvailability();

  function handleSelect(status: string) {
    if (!selectedDate) return;
    setAvailMutation.mutate({
      date: selectedDate,
      status: status as AvailabilityStatus,
    });
    setSelectedDate(null);
  }

  const recentDays = days.slice(0, 7);
  const laterDays = days.slice(7);
  const laterSetCount = laterDays.filter((d) => d.status !== 'free').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="text-white px-4 py-4 flex items-center justify-between"
        style={{ background: '#1890ff' }}
      >
        <h1 className="text-lg font-semibold">我的档期</h1>
        <button onClick={logout} className="text-sm text-blue-200 active:text-white">
          {name} | 退出
        </button>
      </div>

      {/* 近 7 天列表 */}
      <div className="p-4">
        <div className="text-xs font-medium text-gray-400 tracking-wide pb-2 px-1">近 7 天</div>
        {isLoading ? (
          <Loading />
        ) : (
          <div className="space-y-2">
            {recentDays.map((day) => {
              const display = getShortDate(day.date);
              const weekday = getWeekday(day.date);
              const isToday = day.date === today;
              return (
                <div
                  key={day.date}
                  className={`flex items-center justify-between rounded-xl px-4 py-3.5 shadow-sm active:bg-gray-50 ${
                    isToday ? 'bg-blue-50 border border-blue-200' : 'bg-white'
                  }`}
                  onClick={() => setSelectedDate(day.date)}
                >
                  <div>
                    <span className="text-base font-medium text-gray-800">
                      {display}
                      {isToday && <span className="ml-1 text-blue-500 text-xs">今天</span>}
                    </span>
                    <span
                      className={`ml-2 text-xs ${isLunarKeyDay(day.date) ? 'text-red-500 font-medium' : 'text-gray-300'}`}
                    >
                      {getLunarText(day.date)}
                    </span>
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
              <span className="ml-1 text-blue-500">（已设 {laterSetCount} 天）</span>
            )}
          </button>

          {showCalendar && (
            <div className="mt-3 space-y-2">
              {laterDays.map((day) => {
                const display = getShortDate(day.date);
                const weekday = getWeekday(day.date);
                return (
                  <div
                    key={day.date}
                    className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm active:bg-gray-50"
                    onClick={() => setSelectedDate(day.date)}
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-700">{display}</span>
                      <span
                        className={`ml-2 text-xs ${isLunarKeyDay(day.date) ? 'text-red-500 font-medium' : 'text-gray-300'}`}
                      >
                        {getLunarText(day.date)}
                      </span>
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
