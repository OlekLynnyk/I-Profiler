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
    <header className="w-full px-4 py-3 flex flex-wrap justify-between items-center gap-3 bg-transparent text-[#E5E5E5] relative overflow-hidden">
      <div className="flex flex-wrap items-center gap-4 relative z-10">
        <button
          onClick={confirmAndGoHome}
          className="text-lg font-montserrat font-weight-600 text-[#F5F5F5] hover:opacity-75 transition-all flex items-center gap-2"
        >
          <img src="/images/octopus-logo.png" alt="Logo" className="w-6 h-6" />
          I,Profiler
        </button>

        {!pathname.startsWith('/workspace') && (
          <>
            <button
              onClick={() =>
                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
              }
              className="text-sm font-inter text-[#E5E5E5] hover:text-[#C084FC] transition-all"
            >
              About
            </button>
            <button
              onClick={() =>
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
              }
              className="text-sm font-inter text-[#E5E5E5] hover:text-[#C084FC] transition-all"
            >
              Pricing
            </button>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 relative z-10">
        {!isLoading && session && (
          <Link
            href="/workspace"
            className="px-4 py-2 bg-[#C084FC] text-[#212529] text-sm font-inter rounded-2xl hover:bg-[#D8B4FE] transition-all shadow-[0_6px_12px_rgba(0,0,0,0.15)]"
          >
            My Workspace
          </Link>
        )}

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
