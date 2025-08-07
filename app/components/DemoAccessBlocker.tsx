'use client';

import { useDemoAttempts } from '@/app/hooks/useDemoAttempts';

export default function DemoAccessBlocker({ children }: { children: React.ReactNode }) {
  const { demoAttempts, packageType } = useDemoAttempts();
  const isBlocked = packageType === 'Freemium' && demoAttempts === 0;

  return (
    <div className="relative">
      {/* Размываем контент, если блок */}
      <div className={isBlocked ? 'blur-sm pointer-events-none' : ''}>{children}</div>

      {/* Блокирующий баннер */}
      {isBlocked && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-white text-black p-8 rounded shadow-xl max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4">3 demo attempts used</h2>
            <p className="mb-6">Subscribe to continue using the AI assistant.</p>
            <button
              onClick={() => (window.location.href = '/subscribe')}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded transition"
            >
              Subscribe
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
