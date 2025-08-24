'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthProvider';
import { supabase } from '@/lib/supabase/client';
import { useEffect, useRef, useState } from 'react';

type HeaderProps = {
  onLoginClick: () => void;
};

export default function Header({ onLoginClick }: HeaderProps) {
  const { session, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [isShrunk, setIsShrunk] = useState(false);
  const [active, setActive] = useState<'about' | 'pricing' | null>(null);
  const ioRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const onScroll = () => setIsShrunk(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (pathname.startsWith('/workspace')) return;

    ioRef.current?.disconnect();
    const ids: Array<'about' | 'pricing'> = ['about', 'pricing'];
    const elms = ids
      .map((id) => {
        const el = document.getElementById(id);
        return el ? { id, el } : null;
      })
      .filter(Boolean) as Array<{ id: 'about' | 'pricing'; el: Element }>;

    if (!elms.length) return;

    ioRef.current = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];

        if (hit) {
          const id = (hit.target as HTMLElement).id as 'about' | 'pricing';
          setActive(id);
        }
      },
      { threshold: [0.35, 0.5, 0.65], rootMargin: '-40% 0px -45% 0px' }
    );

    elms.forEach(({ el }) => ioRef.current?.observe(el));
    return () => ioRef.current?.disconnect();
  }, [pathname]);

  const confirmAndGoHome = () => {
    if (pathname.startsWith('/workspace')) {
      const confirmLeave = confirm('Are you sure you want to leave your workspace?');
      if (!confirmLeave) return;
    }
    router.push('/');
  };

  const handleLogout = async () => {
    const confirmLeave = confirm('Do you really want to log out and leave the workspace?');
    if (!confirmLeave) return;

    await supabase.auth.signOut();
    router.push('/');
  };

  const scrollTo = (id: 'about' | 'pricing') => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      <div
        className={`
          relative transition-colors duration-200 motion-reduce:transition-none
          ${isShrunk ? 'bg-[rgba(10,12,14,0.56)]' : 'bg-[rgba(10,12,14,0.48)]'}
          supports-[backdrop-filter]:backdrop-blur-md supports-[backdrop-filter]:bg-[rgba(10,12,14,0.40)]
        `}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div
            className="h-14 sm:h-[60px] flex items-center justify-between"
            style={{
              transform: isShrunk ? 'scale(0.97)' : 'none',
              transformOrigin: 'center',
              transition: 'transform 220ms cubic-bezier(0.22,1,0.36,1)',
            }}
          >
            <div className="flex items-center gap-6">
              <button
                onClick={confirmAndGoHome}
                className="
                  group inline-flex items-center gap-2 rounded-xl px-2 py-1
                  ring-1 ring-white/10 hover:ring-white/25 transition
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60
                "
                aria-label="H1NTED — home"
              >
                <img
                  src="/images/octopus-logo.png"
                  alt="Logo"
                  className="w-6 h-6 rounded-full ring-1 ring-[#A855F7]/30"
                />
                <span className="text-white font-semibold tracking-tight group-hover:text-white/90">
                  H1NTED
                </span>
              </button>

              {!pathname.startsWith('/workspace') && (
                <nav className="hidden sm:flex items-center gap-6">
                  <button
                    onClick={() => scrollTo('about')}
                    aria-current={active === 'about' ? 'true' : undefined}
                    className={`
                      relative text-white/80 hover:text-white transition-colors
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60 rounded-md px-1
                      after:content-[''] after:pointer-events-none
                      after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-1
                      after:h-[2px] after:w-0
                      after:bg-gradient-to-r after:from-transparent after:via-[#A855F7]/65 after:to-transparent
                      after:transition-[width] after:duration-200
                      hover:after:w-[120px]
                      ${active === 'about' ? 'text-white after:w-[160px]' : ''}
                    `}
                  >
                    About
                  </button>

                  <button
                    onClick={() => scrollTo('pricing')}
                    aria-current={active === 'pricing' ? 'true' : undefined}
                    className={`
                      relative text-white/80 hover:text-white transition-colors
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60 rounded-md px-1
                      after:content-[''] after:pointer-events-none
                      after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-1
                      after:h-[2px] after:w-0
                      after:bg-gradient-to-r after:from-transparent after:via-[#A855F7]/65 after:to-transparent
                      after:transition-[width] after:duration-200
                      hover:after:w-[120px]
                      ${active === 'pricing' ? 'text-white after:w-[160px]' : ''}
                    `}
                  >
                    Pricing
                  </button>
                </nav>
              )}
            </div>

            <div className="flex items-center gap-4">
              {!isLoading && session && (
                <Link
                  href="/workspace"
                  className="
                    rounded-full px-4 py-1.5 text-sm text-white
                    bg-[#A855F7]/20 ring-1 ring-[#A855F7]/30 backdrop-blur
                    transition-colors hover:bg-[#A855F7]/30 hover:ring-[#A855F7]/50
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60
                  "
                >
                  My Workspace
                </Link>
              )}

              {!isLoading && session ? (
                <button
                  onClick={handleLogout}
                  className="
                    text-white/80 hover:text-white transition-colors
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60 rounded-md px-1
                  "
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={onLoginClick}
                  className="
                    text-white/90 hover:text-white transition-colors
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60 rounded-md px-1
                  "
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>

        <div
          className={`
            pointer-events-none absolute inset-x-0 bottom-0 h-px
            bg-gradient-to-r from-transparent via-white/20 to-transparent
            transition-opacity duration-200 motion-reduce:transition-none
            ${isShrunk ? 'opacity-90' : 'opacity-70'}
          `}
        />
      </div>
    </header>
  );
}
