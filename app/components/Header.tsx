'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthProvider';
import { supabase } from '@/lib/supabase/client';

type HeaderProps = {
  onLoginClick: () => void;
};

export default function Header({ onLoginClick }: HeaderProps) {
  const { session, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

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

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* стеклянный фон */}
      <div className="relative supports-[backdrop-filter]:backdrop-blur bg-black/30 supports-[backdrop-filter]:bg-black/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="h-14 sm:h-[60px] flex items-center justify-between">
            {/* ЛЕВАЯ ЗОНА: логотип + навигация */}
            <div className="flex items-center gap-6">
              <button
                onClick={confirmAndGoHome}
                className="group inline-flex items-center gap-2 rounded-xl px-2 py-1 ring-1 ring-white/10 hover:ring-white/25 transition"
                aria-label="H1NTED — home"
              >
                <img
                  src="/images/octopus-logo.png"
                  alt="Logo"
                  className="w-6 h-6 rounded-full ring-1 ring-purple-300/30"
                />
                <span className="text-white font-semibold tracking-tight group-hover:text-white/90">
                  H1NTED
                </span>
              </button>

              {!pathname.startsWith('/workspace') && (
                <nav className="hidden sm:flex items-center gap-6">
                  <button
                    onClick={() =>
                      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
                    }
                    className="text-white/80 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/60 rounded-md px-1"
                  >
                    About
                  </button>
                  <button
                    onClick={() =>
                      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
                    }
                    className="text-white/80 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/60 rounded-md px-1"
                  >
                    Pricing
                  </button>
                </nav>
              )}
            </div>

            {/* ПРАВАЯ ЗОНА: аутентификация */}
            <div className="flex items-center gap-4">
              {!isLoading && session && (
                <Link
                  href="/workspace"
                  className="rounded-full px-4 py-1.5 text-sm bg-purple-500/20 text-white ring-1 ring-purple-300/30 backdrop-blur transition-colors hover:bg-purple-500/30 hover:ring-purple-300/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/60"
                >
                  My Workspace
                </Link>
              )}

              {!isLoading && session ? (
                <button
                  onClick={handleLogout}
                  className="text-white/80 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/60 rounded-md px-1"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={onLoginClick}
                  className="text-white/90 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/60 rounded-md px-1"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>

        {/* нижний «волосок»-разделитель */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    </header>
  );
}
