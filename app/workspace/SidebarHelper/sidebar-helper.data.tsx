// sidebar-helper.data.tsx
'use client';

import { useUserPlan } from '@/app/hooks/useUserPlan';
import { useInjectPrompt } from '@/app/hooks/useInjectPrompt';
import SavedProfileList from '@/app/components/SavedProfileList';
import { BoxData } from './types';

type Template = {
  id: string;
  title: string; // отображаем в сайдбаре
  content: string; // подставляем в поле ввода
};

export const getSidebarBoxes = (): BoxData[] => {
  const { plan } = useUserPlan();
  const isPro = plan === 'Smarter' || plan === 'Business';

  const injectPrompt = useInjectPrompt();

  // 12 темплейтов (13-й удалён)
  const titles = [
    'Hidden Drivers and Risks',
    'Communication Approach',
    'Decision-Making Style',
    'Improving Team Dynamics',
    'Conflict Management',
    '‘Go/No-Go’ Assistance',
    'Intrinsic Motivation to address',
    'C-level Recruitment',
    'Talent R&D planning',
    'Inner Drivers vs Business',
    'Sales Pitches',
    'Creativity Potential',
  ];

  const contents = [
    'From what the appearance/accessories project about this person: what hidden drivers and collaboration risks should I expect, and how should I collaborate effectively?',
    'From what the appearance/accessories project about this person: which negotiation approach is most likely to work? What words are better to use, and what Intrinsic motivation to address?',
    'From what the appearance/accessories project about this person: what decision-making style is this person most likely to use unconsciously?',
    'From what the appearance/accessories reveal about this person: what is the best role per the Nine Belbin Team Roles, and how should I use this person in the team to improve dynamics?',
    'From what the appearance/accessories project about this person: which conflict-handling approach should I use, including the best opening words and the person’s hidden command and motivation?',
    'From what the appearance/accessories project about this person and based on the most self-projected trait, the hidden command, and the basic unbalanced contradiction, is this person a good fit for ... [your situation] ?',
    'From what the appearance/accessories reveal about this person: which primary motivators should I address in this person, and list all relevant Intrinsic motivators?',
    'From what the appearance/accessories project about this person: does this person fit a C-level role (yes/no), and what are the hiring risks?',
    'From what the appearance/accessories reveal about this person: what approach, words, and motivators would keep this person engaged and developing?',
    'From what the appearance/accessories reveal about this person: how can I align this person’s likely drivers and Basic Unbalanced Contradiction with business goals and approaches?',
    'From what the appearance/accessories project about this person: how should I tailor a sales pitch — words, approach, style, motivators for a ‘Yes’, and the proof types that will convince this person?',
    'From what the appearance/accessories project about this person: what signals indicate innovation/creativity level, and how should I engage it?',
  ];

  const templates: Template[] = titles.map((title, i) => ({
    id: `tpl-${i + 1}`,
    title,
    content: contents[i],
  }));

  const TemplatesContent = () => (
    <div className="flex flex-col gap-2 text-sm text-[var(--text-primary)]">
      {templates.map((t, idx) => (
        <div
          key={t.id}
          onClick={() => {
            // По клику подставляем соответствующий промпт
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
