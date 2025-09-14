'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

/**
 * Gallery White Cube — premium, desktop‑first implementation
 * Route: /gallery (App Router)
 * Visual goals:
 *  - White cube room with 3 frames on the back wall and 1 on each side wall (total 5)
 *  - Slim black frames, grey floor, ceiling track with spotlights, central black bench
 *  - Right-side slide-over panel with artwork info (EN-GB)
 *  - Subtle hover cue to show clickability
 *  - A11y: Esc to close, focus trap in panel, ARIA labels
 *
 * Notes:
 *  - Place placeholder assets in `/public/artworks/01.jpg` ... `/public/artworks/05.jpg` (vertical 3:4 recommended)
 *  - You can replace titles/descriptions later; UI copy is British English only
 */

// —————————————————————————— Data (placeholder) ——————————————————————————
const ARTWORKS: Array<{
  id: string;
  src: string;
  title: string;
  byline?: string;
  description: string;
}> = [
  {
    id: 'a1',
    src: '/artworks/01.jpg',
    title: 'Sunlit Stillness',
    byline: 'Pigment print, 60 × 80 cm, 2024',
    description:
      'An exercise in restraint: a quiet field of light and edges that rewards unhurried looking.',
  },
  {
    id: 'a2',
    src: '/artworks/02.jpg',
    title: 'Quiet Geometry',
    byline: 'Oil on panel, 55 × 73 cm, 2023',
    description:
      'Where shape meets hush: measured forms, balanced tensions, and a whisper of warmth.',
  },
  {
    id: 'a3',
    src: '/artworks/03.jpg',
    title: 'Silver Noon',
    byline: 'Gelatin silver print, 50 × 67 cm, 1976',
    description:
      'A minimal horizon, a dense atmosphere; a precise memory of light at its highest point.',
  },
  {
    id: 'a4',
    src: '/artworks/04.jpg',
    title: 'Inner Harbour',
    byline: 'Acrylic on linen, 80 × 120 cm, 2022',
    description: 'A restrained palette and long, calm strokes that suggest distance and arrival.',
  },
  {
    id: 'a5',
    src: '/artworks/05.jpg',
    title: 'Trace',
    byline: 'Mixed media on cotton rag, 42 × 59 cm, 2021',
    description:
      'A luminous residue of gesture; the image appears almost after you have looked away.',
  },
];

// —————————————————————————— Utility ——————————————————————————
function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

// A tiny focus trap for the slide-over (no dependency)
function useFocusTrap<T extends HTMLElement>(
  enabled: boolean,
  containerRef: React.RefObject<T | null>
) {
  useEffect(() => {
    if (!enabled) return;
    const el = containerRef.current;
    if (!el) return;

    const focusables = () =>
      Array.from(
        el.querySelectorAll<HTMLElement>(
          [
            'a[href]',
            'button:not([disabled])',
            'textarea:not([disabled])',
            'input[type="text"]:not([disabled])',
            'input[type="search"]:not([disabled])',
            'input[type="email"]:not([disabled])',
            'input[type="url"]:not([disabled])',
            'select:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
          ].join(', ')
        )
      );

    const firstFocus = () => focusables()[0];
    const lastFocus = () => {
      const list = focusables();
      return list[list.length - 1];
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const first = firstFocus();
        const last = lastFocus();
        if (!first || !last) return;
        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
      if (e.key === 'Escape') {
        (el.querySelector('[data-close]') as HTMLButtonElement | null)?.click();
      }
    };

    const prev = document.activeElement as HTMLElement | null;
    firstFocus()?.focus();
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      prev?.focus?.();
    };
  }, [enabled, containerRef]);
}

// —————————————————————————— Components ——————————————————————————

// Thin black frame with hover affordances
function Frame({
  item,
  onOpen,
  style,
  className,
  infoHint = true,
}: {
  item: (typeof ARTWORKS)[number];
  onOpen: () => void;
  style?: React.CSSProperties;
  className?: string;
  infoHint?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <button
      onClick={onOpen}
      aria-label={`Open details for ${item.title}`}
      className={classNames(
        'group relative block overflow-hidden ring-1 ring-black/80 bg-white',
        'transition-transform will-change-transform',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-black',
        // Frame proportions & inset mount shadow
        'shadow-[inset_0_0_0_2px_#111,inset_0_0_0_3px_#111,inset_0_0_0_1px_#000000]',
        className || ''
      )}
      style={{
        aspectRatio: '3 / 4',
        ...style,
      }}
    >
      {/* Artwork image */}
      <Image
        src={item.src}
        alt={item.title}
        fill
        sizes="(max-width: 1024px) 40vw, 18vw"
        className={classNames(
          'object-cover object-center',
          'transition-transform duration-500',
          'group-hover:scale-[1.02]'
        )}
        priority={false}
      />

      {/* Hover aura to suggest click */}
      <div
        aria-hidden
        className={classNames(
          'pointer-events-none absolute inset-0 rounded-[2px]',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          'shadow-[0_0_0_1px_rgba(0,0,0,0.9),0_12px_26px_rgba(0,0,0,0.25)]'
        )}
      />

      {/* Info dot (affordance) */}
      {infoHint && (
        <motion.span
          aria-hidden
          initial={reduce ? false : { opacity: 0, scale: 0.9 }}
          animate={reduce ? undefined : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className={classNames(
            'absolute right-2 top-2 grid h-6 w-6 place-items-center',
            'rounded-full bg-black/80 text-white text-[11px] font-semibold',
            'shadow-[0_1px_2px_rgba(0,0,0,0.35)]'
          )}
          title="Open details"
        >
          i
        </motion.span>
      )}
    </button>
  );
}

function Bench() {
  return (
    <div
      aria-hidden
      className="absolute left-1/2 -translate-x-1/2 bottom-[12%] w-[42%] max-w-[680px]"
    >
      {/* Seat */}
      <div className="h-6 bg-black rounded-[6px] shadow-[0_6px_18px_rgba(0,0,0,0.35)]" />
      {/* Legs */}
      <div className="grid grid-cols-4 gap-0 mt-2">
        <div className="h-12 w-[2px] mx-auto bg-black" />
        <div className="h-12 w-[2px] mx-auto bg-black" />
        <div className="h-12 w-[2px] mx-auto bg-black" />
        <div className="h-12 w-[2px] mx-auto bg-black" />
      </div>
    </div>
  );
}

function LightRail() {
  return (
    <div aria-hidden className="absolute left-1/2 -translate-x-1/2 top-3 w-[70%]">
      {/* Track */}
      <div className="h-[6px] bg-neutral-300/60 rounded" />
      {/* Spots */}
      <div className="flex justify-between mt-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-6 h-6 rounded-full bg-gradient-to-b from-neutral-300 to-neutral-100"
          />
        ))}
      </div>
    </div>
  );
}

function ArtworkPanel({
  open,
  item,
  onClose,
}: {
  open: boolean;
  item: (typeof ARTWORKS)[number] | null;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap<HTMLDivElement>(open, ref);

  // Close on outside click
  const onBackdrop = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/20"
          onMouseDown={onBackdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.aside
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby="artwork-title"
            className="absolute right-0 top-0 h-full w-full sm:w-[420px] md:w-[480px] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.25)] focus:outline-none"
            initial={reduce ? { x: 0 } : { x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.38 }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <h3
                id="artwork-title"
                className="text-neutral-900 text-lg font-semibold tracking-tight"
              >
                {item?.title}
              </h3>
              <button
                data-close
                onClick={onClose}
                className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
              >
                <span className="sr-only">Close</span>×
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto h-[calc(100%-56px)]">
              {item && (
                <div className="relative w-full aspect-[4/3] bg-neutral-100">
                  <Image
                    src={item.src}
                    alt={item.title}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 480px"
                    priority={false}
                  />
                </div>
              )}
              {item?.byline && (
                <p className="text-[13px] text-neutral-500 leading-relaxed">{item.byline}</p>
              )}
              <p className="text-[15px] text-neutral-800 leading-7">{item?.description}</p>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// —————————————————————————— Page ——————————————————————————
export default function GalleryPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const reduce = useReducedMotion();

  const openItem = useMemo(() => ARTWORKS.find((a) => a.id === openId) ?? null, [openId]);

  // Page background and perspective container
  return (
    <main
      className={classNames(
        'relative min-h-screen w-full text-neutral-900',
        'select-none' // gallery is passive
      )}
      style={{ background: '#fff' }}
    >
      {/* Room scaffold */}
      <div
        className="relative mx-auto h-[100svh] max-h-[960px] w-full overflow-hidden"
        style={{ perspective: '1200px', perspectiveOrigin: '50% 38%' }}
      >
        {/* Ceiling halo & light rail */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[24%]"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.06), rgba(0,0,0,0.0))',
          }}
        />
        <LightRail />

        {/* Floor gradient */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[34%]"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.10), rgba(0,0,0,0.02))',
          }}
        />

        {/* Back wall */}
        <div className="absolute left-1/2 top-[12%] -translate-x-1/2 w-[72%] h-[54%] bg-white" />

        {/* Left wall */}
        <div
          className="absolute left-[0%] top-[14%] h-[58%] w-[28%] bg-white origin-right"
          style={{ transform: 'rotateY(18deg)' }}
        />
        {/* Right wall */}
        <div
          className="absolute right-[0%] top-[14%] h-[58%] w-[28%] bg-white origin-left"
          style={{ transform: 'rotateY(-18deg)' }}
        />

        {/* Subtle corner seams */}
        <div className="absolute left-1/2 top-[14%] -translate-x-1/2 h-[58%] w-px bg-neutral-200" />
        <div className="absolute left-[28%] top-[14%] h-[58%] w-px bg-neutral-200/60" />
        <div className="absolute right-[28%] top-[14%] h-[58%] w-px bg-neutral-200/60" />

        {/* Frames — back wall (3) */}
        <div className="absolute left-1/2 top-[18%] -translate-x-1/2 grid grid-cols-3 gap-[4%] w-[62%]">
          {ARTWORKS.slice(0, 3).map((item) => (
            <Frame key={item.id} item={item} onOpen={() => setOpenId(item.id)} />
          ))}
        </div>

        {/* Left wall (1) */}
        <div
          className="absolute left-[6%] top-[20%]"
          style={{ transform: 'translateZ(0) rotateY(18deg)' }}
        >
          <div className="w-[220px]">
            <Frame item={ARTWORKS[3]} onOpen={() => setOpenId(ARTWORKS[3].id)} />
          </div>
        </div>

        {/* Right wall (1) */}
        <div
          className="absolute right-[6%] top-[20%]"
          style={{ transform: 'translateZ(0) rotateY(-18deg)' }}
        >
          <div className="w-[220px]">
            <Frame item={ARTWORKS[4]} onOpen={() => setOpenId(ARTWORKS[4].id)} />
          </div>
        </div>

        {/* Bench */}
        <Bench />
      </div>

      {/* Slide-over panel */}
      <ArtworkPanel open={!!openId} item={openItem} onClose={() => setOpenId(null)} />

      {/* Page padding for small screens so nothing is clipped when URL bars overlap */}
      <div className="pb-[env(safe-area-inset-bottom)]" />

      {/* Minimal instruction for users (desktop only) */}
      <div className="hidden md:block absolute left-1/2 -translate-x-1/2 bottom-6 text-[12px] text-neutral-500">
        Click a frame to view details
      </div>
    </main>
  );
}
