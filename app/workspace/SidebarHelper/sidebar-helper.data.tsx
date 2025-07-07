import { BoxData } from './types';
import SavedProfileList from '@/app/components/SavedProfileList';

export const sidebarBoxes: BoxData[] = [
  {
    id: 'templates',
    title: 'Templates',
    description: 'Preset templates for various use cases.',
    renderContent: null,
  },
  {
    id: 'saved-messages',
    title: 'Saved messages',
    description: 'Your collection of saved messages.',
    renderContent: <SavedProfileList />,
  },
  {
    id: 'library',
    title: 'Library',
    description: 'Knowledge library for quick reference.',
    renderContent: null,
  },
  {
    id: 'support-email',
    title: 'Support email',
    description: 'Contact support via email for assistance.',
    renderContent: (
      <div className="text-sm">
        <p className="mb-1">
          If you need help or have questions, please reach out to us at:
        </p>
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
