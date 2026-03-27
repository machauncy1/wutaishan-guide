import { useMemo, useState } from 'react';
import { useDailyGuides, useUpdateGuideStatus } from '../hooks/useAvailability';
import { logout } from '../services/authService';
import {
  todayBJ,
  offsetDateBJ,
  getLunarText,
  isLunarKeyDay,
  getShortDate,
  getWeekday,
} from '../utils/date';
import StatusTag from '../components/StatusTag';
import ActionSheet from '../components/ActionSheet';
import Loading from '../components/Loading';
import type { GuideDay } from '../services/availService';
import { sourceActions, needsSource } from '../constants/availability';

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
  const [selectedGuide, setSelectedGuide] = useState<GuideDay | null>(null);
  const [customDate, setCustomDate] = useState(false);
  const name = localStorage.getItem('avail_name') || '管理员';

  const { data: rawGuides, isLoading } = useDailyGuides(date);
  const updateMutation = useUpdateGuideStatus();

  const guides = useMemo(() => {
    if (!rawGuides) return [];
    return [...rawGuides].sort(
      (a, b) => (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99),
    );
  }, [rawGuides]);

  function handleSelect(status: string) {
    if (!selectedGuide) return;
    updateMutation.mutate({
      guideId: selectedGuide.guideId,
      date,
      status: status as AvailabilityStatus,
    });
    setSelectedGuide(null);
  }

  function handleSelectWithSource(status: string, source: string, sourceNote?: string) {
    if (!selectedGuide) return;
    updateMutation.mutate({
      guideId: selectedGuide.guideId,
      date,
      status: status as AvailabilityStatus,
      source: source as BookingSource,
      sourceNote,
    });
    setSelectedGuide(null);
  }

  const free = guides.filter((g) => g.status === 'free').length;
  const assigned = guides.filter((g) =>
    ['morning', 'afternoon', 'allday'].includes(g.status),
  ).length;
  const leave = guides.filter((g) => g.status === 'leave').length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="text-white px-5 pt-5 pb-6" style={{ background: '#1a6fc4' }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold tracking-wide">导游可用总览</h1>
          <button onClick={logout} className="text-sm text-white/50 active:text-white/80">
            {name} | 退出
          </button>
        </div>

        {/* 日期选择 */}
        <div className="flex gap-2">
          {quickDates.map((qd) => {
            const d = offsetDateBJ(qd.offset);
            const active = date === d && !customDate;
            return (
              <button
                key={qd.offset}
                onClick={() => {
                  setDate(d);
                  setCustomDate(false);
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-white text-blue-900' : 'bg-white/10 text-white/70 active:bg-white/20'
                }`}
              >
                {qd.label}
              </button>
            );
          })}
          <button
            onClick={() => setCustomDate(true)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              customDate ? 'bg-white text-blue-900' : 'bg-white/10 text-white/70 active:bg-white/20'
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
            className="mt-3 w-full px-3 py-2 rounded-lg bg-white/10 text-white text-sm border border-white/15 outline-none"
          />
        )}
      </div>

      {/* 农历 + 统计 */}
      <div className="px-5 pt-4 pb-1">
        <span
          className={`text-sm ${isLunarKeyDay(date) ? 'text-red-500 font-medium' : 'text-gray-400'}`}
        >
          {getShortDate(date)} {getLunarText(date)} {getWeekday(date)}
          {isLunarKeyDay(date) && ' (佛教重要日)'}
        </span>
      </div>
      <div className="px-5 py-1 flex gap-4 text-sm text-gray-500">
        <span>共 {guides.length} 人</span>
        <span className="text-green-600">未派 {free}</span>
        <span className="text-blue-600">已派 {assigned}</span>
        <span className="text-gray-400">请假 {leave}</span>
      </div>

      {/* 导游列表 */}
      <div className="px-4 py-3">
        {isLoading ? (
          <Loading />
        ) : guides.length === 0 ? (
          <p className="text-center text-gray-400 py-8">暂无导游数据</p>
        ) : (
          <div className="space-y-2.5">
            {guides.map((guide) => (
              <div
                key={guide.guideId}
                className="flex items-center justify-between bg-white rounded-xl px-4 py-3.5 shadow-sm active:bg-gray-50 border border-gray-100"
                onClick={() => setSelectedGuide(guide)}
              >
                <div>
                  <span className="text-base font-medium text-gray-800">{guide.name}</span>
                  <span className="ml-2 text-xs text-gray-400">{guide.phone}</span>
                </div>
                <StatusTag
                  status={guide.status}
                  source={guide.source}
                  sourceNote={guide.sourceNote}
                />
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
        sourceActions={sourceActions}
        onSelectWithSource={handleSelectWithSource}
        needsSource={needsSource}
      />
    </div>
  );
}
