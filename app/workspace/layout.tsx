import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Workspace',
  description: 'Main workspace environment in H1NTED AI assistant',
};

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
