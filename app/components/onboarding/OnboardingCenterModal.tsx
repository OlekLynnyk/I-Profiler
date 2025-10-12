'use client';

type Props = {
  title: string;
  body: string;
  primaryLabel: string; // "Start"
  secondaryLabel: string; // "Later"
  onPrimary: () => void | Promise<void>;
  onSecondary: () => void | Promise<void>;
};

export default function OnboardingCenterModal({
  title,
  body,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
}: Props) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onSecondary} />
      <div
        className="relative z-[81] max-w-sm w-[min(92vw,420px)] rounded-2xl
                      bg-[var(--card-bg)] text-[var(--text-primary)]
                      border border-[var(--card-border)] p-4 shadow-2xl"
      >
        <div className="font-semibold text-base">{title}</div>
        <div className="text-sm mt-1 opacity-80">{body}</div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onSecondary}
            className="px-3 h-8 rounded-full text-sm bg-[var(--surface)] hover:bg-[var(--surface-secondary)]"
          >
            {secondaryLabel}
          </button>
          <button
            onClick={onPrimary}
            className="px-3 h-8 rounded-full text-sm bg-white text-black hover:bg-white/90"
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
