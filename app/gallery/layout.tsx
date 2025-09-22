import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'H1NTED Gallery',
  description: 'Premium mosaic gallery in H1NTED',
};

export default function GalleryLayout({ children }: { children: ReactNode }) {
  return children; // ← без JSX
}
