// sidebar-helper.data.tsx
'use client';

import { useUserPlan } from '@/app/hooks/useUserPlan';
import { useInjectPrompt } from '@/app/hooks/useInjectPrompt';
import SavedProfileList from '@/app/components/SavedProfileList';
import { BoxData } from './types';
import { flushSync } from 'react-dom';

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
    'Personality vs Business',
    'Sales Pitches',
    'Creativity Potential',
    'Best Engagement Setting + Icebreaker',
    'Feedback Delivery Calibrator',
  ];

  const contents = [
    'From what the appearance/accessories project about this person: what hidden drivers and collaboration risks should I expect, and how should I collaborate effectively?',
    'From what the appearance/accessories project about this person: which negotiation approach is most likely to work? What words are better to use, and what Intrinsic motivation to address?',
    'From what the appearance/accessories project about this person: what decision-making style is this person most likely to use unconsciously?',
    'From what the appearance/accessories reveal about this person: what is the best role per the Nine Belbin Team Roles, and how should I use this person in the team to improve dynamics?',
    `From what the appearance/accessories project about this person: which conflict-handling approach should I use, incl. best opening words + hidden command & motivation? Structure the answer to the user's question like the following:  a) Persona calibration → b) Predicted reactions & triggers → c) Suggest how to find out what is the root cause of a conflict  → d) suggest how to reframe in their language → e) Joint resolution protecting their values.`,
    'From what the appearance/accessories project about this person and based on the most self-projected trait, the hidden command, and the basic unbalanced contradiction, is this person a good fit (game-theory rationale) for: [YOUR SITUATION]?',
    'From what the appearance/accessories reveal about this person: which primary motivators should I address in this person, and list all relevant Intrinsic motivators?',
    'From what the appearance/accessories project about this person: what are executive-interaction tendencies (potential C-level role fit) + hiring risks to investigate? The possible role the person is considered is [TYPE THE ROLE].',
    'From what the appearance/accessories project about this person: what is the development potential (taking into account that people show who they want to be, but mostly they act from shadow traits)? Also: what approach, words, and motivators keep this person engaged/staying & developing?',
    'From what the appearance/accessories project about this person: how to align likely drivers and Basic Unbalanced Contradiction with business goals/approaches? [TYPE IN BUSINESS GOAL / TASK / COMPANY CULTURE].',
    'From what the appearance/accessories project about this person: how should I tailor a sales pitch — words, approach, style, motivators for a ‘Yes’, and the proof types that will convince this person?',
    'From what the appearance/accessories project about this person: what signals indicate innovation/creativity level, and how should I engage it?',
    'From what the appearance/accessories project about this person: what is the best meeting setting (formal/informal with details why), a tailored icebreaker, and the first line to transition into business; plus a cold-reaction fallback?',
    'From what the appearance/accessories reveal about this person: calibrate feedback delivery for the person to protect their dignity, keep standards, etc. Suggest: Tone note, Best words to use, Opening line, Avoid-phrases, Follow-up check.',
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
            flushSync(() => {
              injectPrompt(t.content);
            });
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
