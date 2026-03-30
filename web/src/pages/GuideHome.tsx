import { useState } from 'react';
import { useMyAvailability, useSetAvailability, useSourceOptions } from '../hooks/useAvailability';
import { logout } from '../services/authService';
import { todayBJ, getLunarText, isLunarKeyDay, getShortDate, getWeekday } from '../utils/date';
import StatusTag from '../components/StatusTag';
import ActionSheet from '../components/ActionSheet';
import type { ActionSheetResult } from '../components/ActionSheet';
import Loading from '../components/Loading';
import { FREE_PERIOD } from '../constants/availability';
import type { DayAvailability } from '../services/availService';

export default function GuideHome() {
  const [selectedDay, setSelectedDay] = useState<DayAvailability | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const name = localStorage.getItem('avail_name') || '导游';
  const today = todayBJ();

  const { data: days = [], isLoading } = useMyAvailability();
  const { data: sourceOptions = [] } = useSourceOptions();
  const setAvailMutation = useSetAvailability();

  function handleConfirm(result: ActionSheetResult) {
    if (!selectedDay) return;
    setAvailMutation.mutate({
      date: selectedDay.date,
      dayStatus: result.dayStatus,
      morning: result.morning,
      afternoon: result.afternoon,
    });
    setSelectedDay(null);
  }

  const recentDays = days.slice(0, 7);
  const laterDays = days.slice(7);
  const laterSetCount = laterDays.filter(
    (d) =>
      d.dayStatus === 'leave' ||
      d.morning?.status === 'dispatched' ||
      d.afternoon?.status === 'dispatched',
  ).length;

  function renderDayRow(day: DayAvailability, compact = false) {
    const display = getShortDate(day.date);
    const weekday = getWeekday(day.date);
    const isToday = day.date === today;
    return (
      <div
        key={day.date}
        className={`flex items-center justify-between rounded-xl px-4 shadow-sm active:bg-gray-50 border ${
          compact
            ? 'bg-white border-gray-100 py-3'
            : isToday
              ? 'bg-blue-50 border-blue-200 py-3.5'
              : 'bg-white border-gray-100 py-3.5'
        }`}
        onClick={() => setSelectedDay(day)}
      >
        <div>
          <span className={`${compact ? 'text-sm' : 'text-base'} font-medium text-gray-800`}>
            {display}
            {isToday && !compact && <span className="ml-1 text-blue-600 text-xs">今天</span>}
          </span>
          <span
            className={`ml-2 text-xs ${isLunarKeyDay(day.date) ? 'text-red-500 font-medium' : 'text-gray-300'}`}
          >
            {getLunarText(day.date)}
          </span>
          <span className={`ml-2 ${compact ? 'text-xs' : 'text-sm'} text-gray-400`}>{weekday}</span>
        </div>
        <StatusTag dayStatus={day.dayStatus} morning={day.morning} afternoon={day.afternoon} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="text-white px-5 pt-5 pb-6" style={{ background: '#1a6fc4' }}>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-wide">我的档期</h1>
          <button onClick={logout} className="text-sm text-white/50 active:text-white/80">
            {name} | 退出
          </button>
        </div>
      </div>

      {/* 近 7 天列表 */}
      <div className="p-4">
        <div className="text-xs font-medium text-gray-400 tracking-wide pb-2 px-1">近 7 天</div>
        {isLoading ? (
          <Loading />
        ) : (
          <div className="space-y-2.5">{recentDays.map((day) => renderDayRow(day))}</div>
        )}
      </div>

      {/* 更远日期入口 */}
      {laterDays.length > 0 && (
        <div className="px-4 pb-4">
          <button
            className="w-full py-3 rounded-xl bg-white shadow-sm border border-gray-100 text-center text-sm text-gray-600 active:bg-gray-50"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            {showCalendar ? '收起' : '设置更远日期'}
            {!showCalendar && laterSetCount > 0 && (
              <span className="ml-1 text-blue-600">（已设 {laterSetCount} 天）</span>
            )}
          </button>

          {showCalendar && (
            <div className="mt-3 space-y-2.5">
              {laterDays.map((day) => renderDayRow(day, true))}
            </div>
          )}
        </div>
      )}

      <ActionSheet
        visible={!!selectedDay}
        title={selectedDay ? `设置 ${selectedDay.date} 状态` : ''}
        currentDayStatus={selectedDay?.dayStatus ?? 'free'}
        currentMorning={selectedDay?.morning ?? FREE_PERIOD}
        currentAfternoon={selectedDay?.afternoon ?? FREE_PERIOD}
        sourceOptions={sourceOptions}
        onConfirm={handleConfirm}
        onClose={() => setSelectedDay(null)}
      />
    </div>
  );
}
