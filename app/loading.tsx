// app/loading.tsx
'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function GlobalLoading() {
  const [allowAnimation, setAllowAnimation] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReducedMotion(true);
      return;
    }
    const nav = navigator as any;
    const connection = nav?.connection || nav?.mozConnection || nav?.webkitConnection;
    if (connection) {
      if (connection.saveData) return;
      if (['2g', 'slow-2g', '3g'].includes(connection.effectiveType)) return;
    }
    setAllowAnimation(true);
  }, []);

  return (
    <div
      className="flex items-center justify-center h-[100dvh] w-full bg-[var(--background)]"
      role="status"
      aria-live="polite"
    >
      <Image
        src="/loading/octo-static.webp"
        alt="Loading"
        width={96}
        height={96}
        priority
        className={`${allowAnimation && !reducedMotion ? 'animate-octo-pulse-soft' : ''} drop-shadow-md select-none`}
      />
      {!allowAnimation || reducedMotion ? <span className="sr-only">Loading…</span> : null}
    </div>
  );
}
