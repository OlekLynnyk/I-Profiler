'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthProvider';
import { supabase } from '@/lib/supabase/client';
import { azeretMono } from '@/app/fonts';

type HeaderProps = {
  onLoginClick: () => void;
  sticky?: boolean;
  bg?: 'transparent' | 'black';
};

export default function Header({ onLoginClick, sticky = true, bg = 'transparent' }: HeaderProps) {
  const { session, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const positionClass = sticky ? 'sticky top-0' : 'static';
  const bgClass = bg === 'black' ? 'bg-black' : 'bg-transparent';

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
    <header
      className={`${positionClass} z-50 w-full pointer-events-auto ${bgClass} ${azeretMono.variable} font-mono`}
    >
      {/* mobile: 24px вертикаль, 12px горизонталь, высота 88px; desktop (lg+): как сейчас */}
      <div
        className="
        mx-auto w-full flex items-center justify-between
        px-3 py-6 h-[88px]             /* mobile (Figma) */
        lg:max-w-[1440px] lg:px-[100px] lg:h-[104px] lg:gap-[97px] /* desktop */
      "
      >
        {/* Логотип */}
        <Link
          href="/"
          onClick={(e) => {
            e.preventDefault();
            confirmAndGoHome();
          }}
          className="
            inline-flex items-center text-white
            text-[15px] leading-[22px] tracking-[0.02em] small-caps   /* mobile (Figma) */
            lg:text-[20px] lg:leading-[29px]                          /* desktop */
          "
        >
          H1NTED
        </Link>

        {/* Правая группа */}
        <div className="flex items-center gap-6">
          {/* gap-6 = 24px (Figma) */}
          {/* Plans */}
          {pathname !== '/pricing' && (
            <Link
              href="/pricing#pricing"
              className="
               font-mono small-caps inline-flex items-center justify-center
               w-[80px] h-[40px] rounded-[8px]
               text-white text-[15px] leading-[22px] tracking-[0.02em]
               lg:w-[88px] lg:h-[40px] lg:rounded-[6px]
               lg:text-[16px] lg:leading-[2px]
              "
              aria-label="Go to pricing"
            >
              Plans
            </Link>
          )}

          {/* Login / Logout */}
          {!isLoading &&
            (session ? (
              <button
                onClick={handleLogout}
                className="
                font-mono small-caps inline-flex items-center justify-center
                w-[80px] h-[40px] rounded-[8px] bg-[#2E2E2E]
                text-white text-[15px] leading-[22px] tracking-[0.02em]  /* mobile (Figma) */
                lg:w-[88px] lg:h-[40px] lg:rounded-[6px]
                lg:text-[16px] lg:leading-[24px]                          /* desktop (как сейчас) */
              "
                aria-label="Logout"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={onLoginClick}
                className="
                font-mono small-caps inline-flex items-center justify-center
                w-[80px] h-[40px] rounded-[8px] bg-[#2E2E2E]
                text-white text-[15px] leading-[22px] tracking-[0.02em]  /* mobile (Figma) */
                lg:w-[88px] lg:h-[40px] lg:rounded-[6px]
                lg:text-[16px] lg:leading-[24px]                          /* desktop (как сейчас) */
              "
                aria-label="Login"
              >
                Login
              </button>
            ))}
        </div>
      </div>
    </header>
  );
}
