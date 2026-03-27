import { useEffect, useRef, useState } from 'react';

export interface Action {
  label: string;
  value: string;
  disabled?: boolean;
}

interface ActionSheetProps {
  visible: boolean;
  title: string;
  actions: Action[];
  currentValue?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  // 两步选择：选择已派状态后，继续选择平台
  sourceActions?: Action[];
  onSelectWithSource?: (status: string, source: string, sourceNote?: string) => void;
  needsSource?: (value: string) => boolean;
}

export default function ActionSheet({
  visible,
  title,
  actions,
  currentValue,
  onSelect,
  onClose,
  sourceActions,
  onSelectWithSource,
  needsSource,
}: ActionSheetProps) {
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherText, setOtherText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!visible) {
      setPendingStatus(null);
      setShowOtherInput(false);
      setOtherText('');
    }
  }, [visible]);

  useEffect(() => {
    if (showOtherInput) {
      inputRef.current?.focus();
    }
  }, [showOtherInput]);

  if (!visible) return null;

  const showingSource = pendingStatus !== null && sourceActions;

  function handleStatusClick(value: string) {
    if (sourceActions && needsSource?.(value)) {
      setPendingStatus(value);
    } else {
      onSelect(value);
    }
  }

  function handleSourceClick(source: string) {
    if (!pendingStatus || !onSelectWithSource) return;
    if (source === 'other') {
      setShowOtherInput(true);
      return;
    }
    onSelectWithSource(pendingStatus, source);
  }

  function handleOtherConfirm() {
    if (!pendingStatus || !onSelectWithSource || !otherText.trim()) return;
    onSelectWithSource(pendingStatus, 'other', otherText.trim());
  }

  function handleBack() {
    if (showOtherInput) {
      setShowOtherInput(false);
      setOtherText('');
    } else {
      setPendingStatus(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40" />
      <div
        className="relative z-10 w-full rounded-t-2xl bg-white pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 text-center text-sm text-gray-500 border-b">
          {showOtherInput ? '输入平台名称' : showingSource ? '选择派单平台' : title}
        </div>

        {showOtherInput ? (
          <div className="px-4 py-4 space-y-3">
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
            <button
              disabled={!otherText.trim()}
              onClick={handleOtherConfirm}
              className={`w-full py-3 rounded-xl text-base font-medium ${
                otherText.trim()
                  ? 'bg-blue-500 text-white active:bg-blue-600'
                  : 'bg-gray-100 text-gray-300'
              }`}
            >
              确定
            </button>
          </div>
        ) : showingSource ? (
          sourceActions.map((action) => (
            <button
              key={action.value}
              disabled={action.disabled}
              className={`w-full px-4 py-3.5 text-center text-base border-b border-gray-100 last:border-b-0 ${
                action.disabled ? 'text-gray-300' : 'active:bg-gray-50'
              }`}
              onClick={() => handleSourceClick(action.value)}
            >
              {action.label}
            </button>
          ))
        ) : (
          actions.map((action) => {
            const isCurrent = action.value === currentValue;
            return (
              <button
                key={action.value}
                disabled={isCurrent}
                className={`w-full px-4 py-3.5 text-center text-base border-b border-gray-100 last:border-b-0 ${
                  isCurrent ? 'text-gray-300' : 'active:bg-gray-50'
                }`}
                onClick={() => handleStatusClick(action.value)}
              >
                {action.label}
                {isCurrent ? '（当前）' : ''}
              </button>
            );
          })
        )}

        <div className="h-2 bg-gray-100" />
        {showingSource || showOtherInput ? (
          <button
            className="w-full px-4 py-3.5 text-center text-base text-gray-500 active:bg-gray-50"
            onClick={handleBack}
          >
            返回
          </button>
        ) : (
          <button
            className="w-full px-4 py-3.5 text-center text-base text-gray-500 active:bg-gray-50"
            onClick={onClose}
          >
            取消
          </button>
        )}
      </div>
    </div>
  );
}
