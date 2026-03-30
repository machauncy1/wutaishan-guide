import { useEffect, useRef, useState } from 'react';

interface PeriodState {
  status: PeriodStatus;
  source: string;
}

export interface ActionSheetResult {
  dayStatus: DayStatus;
  morning: PeriodInfo;
  afternoon: PeriodInfo;
}

interface ActionSheetProps {
  visible: boolean;
  title: string;
  currentDayStatus: DayStatus;
  currentMorning: PeriodInfo;
  currentAfternoon: PeriodInfo;
  sourceOptions: string[];
  onConfirm: (result: ActionSheetResult) => void;
  onClose: () => void;
}

export default function ActionSheet({
  visible,
  title,
  currentDayStatus,
  currentMorning,
  currentAfternoon,
  sourceOptions,
  onConfirm,
  onClose,
}: ActionSheetProps) {
  const [isLeave, setIsLeave] = useState(false);
  const [morning, setMorning] = useState<PeriodState>({ status: 'free', source: '' });
  const [afternoon, setAfternoon] = useState<PeriodState>({ status: 'free', source: '' });
  const [otherPeriod, setOtherPeriod] = useState<'morning' | 'afternoon' | null>(null);
  const [otherText, setOtherText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // 打开时用当前状态初始化
  useEffect(() => {
    if (visible) {
      setIsLeave(currentDayStatus === 'leave');
      setMorning({
        status: currentMorning.status,
        source: currentMorning.source || '',
      });
      setAfternoon({
        status: currentAfternoon.status,
        source: currentAfternoon.source || '',
      });
      setOtherPeriod(null);
      setOtherText('');
    }
  }, [visible, currentDayStatus, currentMorning, currentAfternoon]);

  useEffect(() => {
    if (otherPeriod) inputRef.current?.focus();
  }, [otherPeriod]);

  if (!visible) return null;

  function handleConfirm() {
    if (isLeave) {
      onConfirm({ dayStatus: 'leave', morning: { status: 'free' }, afternoon: { status: 'free' } });
      return;
    }
    const result: ActionSheetResult = {
      dayStatus: 'free',
      morning:
        morning.status === 'dispatched'
          ? { status: 'dispatched', source: morning.source }
          : { status: 'free' },
      afternoon:
        afternoon.status === 'dispatched'
          ? { status: 'dispatched', source: afternoon.source }
          : { status: 'free' },
    };
    onConfirm(result);
  }

  function handleOtherConfirm() {
    if (!otherPeriod || !otherText.trim()) return;
    const setter = otherPeriod === 'morning' ? setMorning : setAfternoon;
    setter({ status: 'dispatched', source: otherText.trim() });
    setOtherPeriod(null);
    setOtherText('');
  }

  // 已派时必须有 source 才能确认
  const canConfirm =
    isLeave ||
    ((morning.status === 'free' || morning.source) &&
      (afternoon.status === 'free' || afternoon.source));

  function renderPeriodRow(
    label: string,
    period: PeriodState,
    setPeriod: (p: PeriodState) => void,
    periodKey: 'morning' | 'afternoon',
  ) {
    return (
      <div className={`px-4 py-3 ${isLeave ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm font-medium text-gray-700 w-8">{label}</span>
          <button
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              period.status === 'free'
                ? 'bg-green-100 text-green-700 ring-1 ring-green-300'
                : 'bg-gray-50 text-gray-400'
            }`}
            onClick={() => setPeriod({ status: 'free', source: '' })}
          >
            未派
          </button>
          <button
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              period.status === 'dispatched'
                ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
                : 'bg-gray-50 text-gray-400'
            }`}
            onClick={() =>
              setPeriod({ status: 'dispatched', source: period.source || sourceOptions[0] || '' })
            }
          >
            已派
          </button>
        </div>

        {/* 平台选择 */}
        {period.status === 'dispatched' && (
          <div className="ml-11 flex flex-wrap gap-2">
            {sourceOptions.map((opt) => (
              <button
                key={opt}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  period.source === opt
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                }`}
                onClick={() => setPeriod({ ...period, source: opt })}
              >
                {opt}
              </button>
            ))}
            <button
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                period.source && !sourceOptions.includes(period.source)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 active:bg-gray-200'
              }`}
              onClick={() => {
                setOtherText(
                  period.source && !sourceOptions.includes(period.source) ? period.source : '',
                );
                setOtherPeriod(periodKey);
              }}
            >
              {period.source && !sourceOptions.includes(period.source) ? period.source : '其他…'}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40" />
      <div
        className="relative z-10 w-full rounded-t-2xl bg-white pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题 */}
        <div className="px-4 py-3 text-center text-sm text-gray-500 border-b">{title}</div>

        {/* 自定义平台输入浮层 */}
        {otherPeriod ? (
          <div className="px-4 py-4 space-y-3">
            <div className="text-sm text-gray-500 text-center">
              输入{otherPeriod === 'morning' ? '上午' : '下午'}平台名称
            </div>
            <input
              ref={inputRef}
              type="text"
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleOtherConfirm()}
              placeholder="请输入平台名称"
              maxLength={20}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base outline-none focus:border-blue-400"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setOtherPeriod(null);
                  setOtherText('');
                }}
                className="flex-1 py-3 rounded-xl text-base font-medium bg-gray-100 text-gray-500 active:bg-gray-200"
              >
                返回
              </button>
              <button
                disabled={!otherText.trim()}
                onClick={handleOtherConfirm}
                className={`flex-1 py-3 rounded-xl text-base font-medium ${
                  otherText.trim()
                    ? 'bg-blue-500 text-white active:bg-blue-600'
                    : 'bg-gray-100 text-gray-300'
                }`}
              >
                确定
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 上午 */}
            {renderPeriodRow('上午', morning, setMorning, 'morning')}
            <div className="border-t border-gray-100" />
            {/* 下午 */}
            {renderPeriodRow('下午', afternoon, setAfternoon, 'afternoon')}

            {/* 请假 */}
            <div className="border-t border-gray-100" />
            <button
              className="w-full px-4 py-3 flex items-center gap-3"
              onClick={() => setIsLeave(!isLeave)}
            >
              <span
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  isLeave ? 'bg-gray-500 border-gray-500' : 'border-gray-300'
                }`}
              >
                {isLeave && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span className="text-sm text-gray-600">请假（全天不可用）</span>
            </button>

            {/* 操作按钮 */}
            <div className="border-t border-gray-100" />
            <div className="px-4 py-3 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl text-base font-medium bg-gray-100 text-gray-500 active:bg-gray-200"
              >
                取消
              </button>
              <button
                disabled={!canConfirm}
                onClick={handleConfirm}
                className={`flex-1 py-3 rounded-xl text-base font-medium ${
                  canConfirm
                    ? 'bg-blue-500 text-white active:bg-blue-600'
                    : 'bg-gray-100 text-gray-300'
                }`}
              >
                确认
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
