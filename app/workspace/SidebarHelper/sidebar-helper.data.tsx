'use client';

import { useUserPlan } from '@/app/hooks/useUserPlan';
import { useInjectPrompt } from '@/app/hooks/useInjectPrompt';
import SavedProfileList from '@/app/components/SavedProfileList';
import { BoxData } from './types';
import { flushSync } from 'react-dom';
import { isPaidPlan } from '@/types/plan'; // 👈 добавлено

type Template = {
  id: string;
  title: string; // отображаем в сайдбаре
  content: string; // подставляем в поле ввода
};

export const getSidebarBoxes = (): BoxData[] => {
  const { plan } = useUserPlan();
  const isPro = isPaidPlan(plan); // 👈 было Smarter||Business
  const isUpperTier = plan === 'Smarter' || plan === 'Business'; // 👈 для Library (Smarter+Business)

  const injectPrompt = useInjectPrompt();

  // 12 темплейтов (13-й удалён)
  const titles = [
    'Hidden Drivers and Risks',
    'Communication Approach',
    'Decision-Making Style',
    'Improving Team Dynamics',
    'Conflict Management',
    '‘Go/No-Go’ Assistance',
    'Intrinsic Motivation to Address',
    'C-level Recruitment',
    'Talent R&D Planning',
    'Personality vs Business',
    'Sales Pitches',
    'Creativity Potential',
    'Best Engagement Setting',
    'Feedback Delivery Calibrator',
  ];

  const contents = [
    'Based on the results of the analysis, what are the person’s intrinsic drivers (hidden drivers) and key collaboration risks, and what would be the most effective collaboration tactic?',
    'Based on the results of the analysis, what negotiation approach is most likely to work, which words/phrases should be used, and which intrinsic motivations should be addressed?',
    'Based on the results of the analysis, what unconscious decision-making style is most likely, and which biases/risks accompany it?',
    'Based on the results of the analysis: identify the person’s primary and secondary Belbin Team Roles, and how to leverage them in the team; include one key risk to watch.',
    `Based on the results of the analysis, which conflict-handling approach should I use, including best opening words, a hidden command, and the intrinsic motivation to address? Structure the answer as: (a) Persona calibration → (b) Predicted reactions & triggers → (c) How to find the root cause → (d) How to reframe in their language → (e) Joint resolution protecting their values.`,
    'Based on the results of the analysis, what is the person’s basic unbalanced contradiction, what risks does it carry, and does this contradiction fit [YOUR SITUATION] (game-theory Yes/No)?',
    'Based on the results of the analysis, which primary motivators should I address in this person, list all relevant intrinsic motivators, and how will this person evolve over time based on the basic unbalanced contradiction?',
    'Based on the results of the analysis, what are the person’s executive-interaction tendencies, their potential C-level role fit, and the hiring risks to investigate for the role of [TYPE THE ROLE]?',
    'Based on the results of the analysis, what is the person’s personal development potential (considering that people often act from shadow traits and can develop toward expressed strengths relative to the basic unbalanced contradiction)? Also, what approach, words, and motivators should I use to communicate a development plan?',
    'Based on the results of the analysis, how aligned are the person’s hidden drivers and Basic Unbalanced Contradiction with the business goals/approaches? What is perfectly aligned, and what contradicts [STATE BUSINESS GOAL AND TRADE SECTOR]?',
    'Based on the results of the analysis, how should I tailor a sales pitch to the person’s needs — words to use, approaches, style, motivators to leverage for a “Yes” answer, and the proof types that will convince this person?',
    'Based on the results of the analysis, does this person show potential for innovation/creativity, at what level (0–10), how should I work with it, and what risks does the person carry?',
    'Based on the results of the analysis, provide: (a) Best meeting setting (formal vs. informal) (b) Details that matter & why (c) Tailored icebreaker (d) First line to transition into business (e) Cold-reaction scenario & how to respond.',
    'Based on the results of the analysis, calibrate feedback delivery for this person to protect their dignity while maintaining standards. Provide: Tone note, Best words to use, Opening line, Avoid-phrases, Follow-up check.',
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
          onMouseDown={(e) => e.stopPropagation()} // ← гасим всплытие ещё до click
          onClick={(e) => {
            e.stopPropagation(); // ← клики внутри контента не схлопывают SidebarBox
            e.preventDefault();
            flushSync(() => {
              injectPrompt(t.content); // вставляем текст, остаёмся открытыми
            });
          }}
          className="cursor-pointer hover:text-[var(--accent)]"
        >
          {`${idx + 1}. ${t.title}`}
        </div>
      ))}
    </div>
  );

  // 🔒 разные сообщения блокировок
  const LockedPaidMessage = () => (
    <div className="text-sm text-[var(--text-secondary)] italic">
      🔒 Available on paid plans (Select, Smarter, Business).
    </div>
  );
  const LockedUpperTierMessage = () => (
    <div className="text-sm text-[var(--text-secondary)] italic">
      🔒 Available on Smarter & Business plans.
    </div>
  );

  const SavedMessagesContent = () => {
    return <SavedProfileList />;
  };

  const LibraryContent = () => {
    if (!isUpperTier) return <LockedUpperTierMessage />;
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
    },
    {
      id: 'library',
      title: 'Library',
      description: 'Knowledge library for quick reference.',
      renderContent: <LibraryContent />,
      locked: !isUpperTier, // 👈 только Smarter & Business
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
