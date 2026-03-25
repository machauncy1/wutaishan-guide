interface Action {
  label: string;
  value: string;
}

interface ActionSheetProps {
  visible: boolean;
  title: string;
  actions: Action[];
  onSelect: (value: string) => void;
  onClose: () => void;
}

export default function ActionSheet({
  visible,
  title,
  actions,
  onSelect,
  onClose,
}: ActionSheetProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40" />
      <div
        className="relative z-10 w-full rounded-t-2xl bg-white pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 text-center text-sm text-gray-500 border-b">{title}</div>
        {actions.map((action) => (
          <button
            key={action.value}
            className="w-full px-4 py-3.5 text-center text-base active:bg-gray-50 border-b border-gray-100 last:border-b-0"
            onClick={() => onSelect(action.value)}
          >
            {action.label}
          </button>
        ))}
        <div className="h-2 bg-gray-100" />
        <button
          className="w-full px-4 py-3.5 text-center text-base text-gray-500 active:bg-gray-50"
          onClick={onClose}
        >
          取消
        </button>
      </div>
    </div>
  );
}
