'use client';

import { useUserPlan } from '@/app/hooks/useUserPlan';
import { useInjectPrompt } from '@/app/hooks/useInjectPrompt';
import SavedProfileList from '@/app/components/SavedProfileList';
import { BoxData } from './types';

type Template = {
  id: string;
  title: string; // отображаем в сайдбаре
  content: string; // подставляем в поле ввода (пока: "тест N")
};

export const getSidebarBoxes = (): BoxData[] => {
  const { plan } = useUserPlan();
  const isPro = plan === 'Smarter' || plan === 'Business';

  const injectPrompt = useInjectPrompt();

  // Заголовки от тебя + контент-заглушки "тест N"
  const titles = [
    'Communication Strategy for Negotiations',
    'Improving Team Dynamics',
    'Conflict Management Profiling',
    'Personal Motivation Assessment',
    'Targeted Communications',
    'Motivation for ‘Go/No-Go’ Decisions',
    'Talent Retention and Development Strategy',
    'Decision-Making Style Assessment',
    'Aligning Personal Drivers with Org. Goals',
    'Customisation of Sales Pitches',
    'Persuasive Proposals in Sales',
    'Selection of C-Level Candidates',
    'Innovation and Creativity Potential',
  ];

  const templates: Template[] = titles.map((title, i) => ({
    id: `tpl-${i + 1}`,
    title,
    content: `тест ${i + 1}`, // сюда потом подставим реальные большие промпты
  }));

  const TemplatesContent = () => (
    <div className="flex flex-col gap-2 text-sm text-[var(--text-primary)]">
      {templates.map((t, idx) => (
        <div
          key={t.id}
          onClick={() => {
            // Поведение: по клику подставляем большой промпт
            // По умолчанию — замена содержимого поля ввода
            injectPrompt(t.content);
          }}
          className="cursor-pointer hover:text-[var(--accent)]"
        >
          {`${idx + 1}. ${t.title}`}
        </div>
      ))}
    </div>
  );

  const LockedMessage = () => (
    <div className="text-sm text-[var(--text-secondary)] italic">
      🔒 Available on Smarter & Business plans.
    </div>
  );

  const SavedMessagesContent = () => {
    if (!isPro) return <LockedMessage />;
    return <SavedProfileList />;
  };

  const LibraryContent = () => {
    if (!isPro) return <LockedMessage />;
    return (
      <div className="flex flex-col gap-2 text-sm text-[var(--text-primary)]">
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
      title: 'Templates',
      description: 'Preset templates for various use cases.',
      renderContent: <TemplatesContent />,
    },
    {
      id: 'saved-messages',
      title: 'Saved messages',
      description: 'Your collection of saved messages.',
      renderContent: <SavedMessagesContent />,
      locked: !isPro,
    },
    {
      id: 'library',
      title: 'Library',
      description: 'Knowledge library for quick reference.',
      renderContent: <LibraryContent />,
      locked: !isPro,
    },
    {
      id: 'support-email',
      title: 'Support email',
      description: 'Contact support via email for assistance.',
      renderContent: (
        <div className="text-sm">
          <p className="mb-1">If you need help or have questions, please reach out to us at:</p>
          <p className="font-semibold text-[var(--accent)]">
            <a
              href="mailto:support@iprofiler.ai"
              className="underline hover:text-[var(--text-primary)]"
            >
              support@iprofiler.ai
            </a>
          </p>
        </div>
      ),
    },
  ];
};
