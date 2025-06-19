'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthProvider';
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

type HeaderProps = {
  onLoginClick: () => void;
};

export default function Header({ onLoginClick }: HeaderProps) {
  const { session, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [language, setLanguage] = useState<'EN' | 'RU'>('EN');

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
    <header className="w-full px-4 py-3 flex justify-between items-center shadow-[0_6px_12px_rgba(0,0,0,0.15)] bg-[#1A1E23] text-[#E5E5E5] relative overflow-hidden">
      <div className="flex items-center space-x-4 relative z-10">
        <button
          onClick={confirmAndGoHome}
          className="text-lg font-montserrat font-weight-600 text-[#F5F5F5] hover:opacity-75 transition-all"
        >
          I,Profiler
        </button>

        {!pathname.startsWith('/workspace') && (
          <>
            <button
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm font-inter text-[#E5E5E5] hover:text-[#C084FC] transition-all"
            >
              About
            </button>
            <button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm font-inter text-[#E5E5E5] hover:text-[#C084FC] transition-all"
            >
              Pricing
            </button>
          </>
        )}
      </div>

      <div className="flex items-center space-x-4 relative z-10">
        {!isLoading && session && (
          <Link
            href="/workspace"
            className="px-4 py-2 bg-[#C084FC] text-[#212529] text-sm font-inter rounded-2xl hover:bg-[#D8B4FE] transition-all shadow-[0_6px_12px_rgba(0,0,0,0.15)]"
          >
            My Workspace
          </Link>
        )}

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'EN' | 'RU')}
          className="bg-[#F6F5ED] border border-[#D1D4D6] text-[#374151] text-sm rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#C084FC]"
        >
          <option value="EN">EN</option>
          <option value="RU">RU</option>
        </select>

        {!isLoading && session ? (
          <button
            onClick={handleLogout}
            className="text-sm font-inter text-[#E5E5E5] hover:text-[#C084FC] transition-all"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={onLoginClick}
            className="text-sm font-inter text-[#E5E5E5] hover:text-[#C084FC] transition-all"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}
