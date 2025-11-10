'use client';

import { BoxData } from './types';
import { isPaidPlan } from '@/types/plan';
import TemplatesPanel from '@/app/components/TemplatesPanel';

export const getSidebarBoxes = ({
  plan,
  injectPrompt, // оставляем сигнатуру как есть (может использоваться снаружи)
  isCdrMode = false,
  onSelectForCdr,
}: {
  plan?: string;
  injectPrompt: (text: string) => void;
  isCdrMode?: boolean;
  onSelectForCdr?: (p: any) => void;
}): BoxData[] => {
  const isPro = isPaidPlan(plan ?? 'Free'); // сейчас не используется, но не ломаем контракт
  const isUpperTier = (plan ?? '') === 'Smarter' || (plan ?? '') === 'Business';

  const LockedUpperTierMessage = () => (
    <div className="text-sm text-[var(--text-secondary)] italic" data-templates>
      🔒 Available on Smarter & Business plans.
    </div>
  );

  const LibraryContent = () => {
    if (!isUpperTier) return <LockedUpperTierMessage />;
    return (
      <div className="flex flex-col gap-2 text-sm text-[var(--text-primary)]" data-templates>
        <div className="cursor-default">Article One</div>
        <div className="cursor-default">Article Two</div>
        <div className="cursor-default">Article Three</div>
        <div className="cursor-default">Article Four</div>
        <div className="cursor-default">Article Five</div>
      </div>
    );
  };

  return [
    {
      id: 'templates',
      title: 'Diplomacy Templates',
      description: 'Preset templates for various use cases.',
      // ⬇️ Новый динамический контент с папками + файлами, Create block/template, CDRs-гейт
      renderContent: <TemplatesPanel isCdrMode={isCdrMode} />,
    },
    {
      id: 'saved-messages',
      title: 'Saved messages',
      description: 'Your collection of saved messages.',
      // Контент задаётся в SidebarHelper (патчинг боксов).
      renderContent: null,
    },
    {
      id: 'library',
      title: 'Library',
      description: 'Knowledge library for quick reference.',
      renderContent: <LibraryContent />,
      locked: !isUpperTier,
    },
    {
      id: 'support-email',
      title: 'Support email',
      description: 'Contact support via email for assistance.',
      renderContent: (
        <div
          className="text-sm select-text"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          data-templates
        >
          <p className="font-semibold">
            Contact us at{' '}
            <a
              href="mailto:hello@h1nted.com"
              className="underline text-[var(--accent)] hover:text-[var(--text-primary)]"
            >
              hello@h1nted.com
            </a>
          </p>
        </div>
      ),
    },
  ];
};
