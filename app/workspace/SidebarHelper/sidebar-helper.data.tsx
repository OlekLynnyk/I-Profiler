'use client';

import { useUserPlan } from '@/app/hooks/useUserPlan';
import { useInjectPrompt } from '@/app/hooks/useInjectPrompt';
import SavedProfileList from '@/app/components/SavedProfileList';
import { BoxData } from './types';

export const getSidebarBoxes = (): BoxData[] => {
  const { plan } = useUserPlan();
  const isPro = plan === 'Smarter' || plan === 'Business';

  const injectPrompt = useInjectPrompt();

  const promptTemplates: string[] = [
    'Summarise this text in 3 bullet points.',
    'What are the key insights from this content?',
    'Explain this to a 10-year-old.',
    'Translate this to simple English.',
    'List action items based on this text.',
    'Rewrite this more professionally.',
    'What questions does this raise?',
    'Provide counterarguments to this text.',
    'Give a short summary with hashtags.',
    'Generate a tweet based on this.',
  ];

  const TemplatesContent = () => (
    <div className="flex flex-col gap-2 text-sm text-[var(--text-primary)]">
      {promptTemplates.map((text) => (
        <div
          key={text}
          onClick={() => injectPrompt(text)}
          className="cursor-pointer hover:text-[var(--accent)]"
        >
          {text}
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
