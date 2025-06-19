'use client';

import React, { useState, type ReactNode } from 'react';
import { useProfile } from '../hooks/useProfile';
import { PlanProgress } from '@/components/PlanProgress';
import { PackageType } from '@/types/plan';
import { useUserPlan } from '../hooks/useUserPlan';

type SidebarProps = {
  onClose: () => void;
  packageType: PackageType;
};

type SectionBox = {
  id: string;
  title: string;
  content: ReactNode;
};

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Sidebar({ onClose, packageType }: SidebarProps) {
  const { profile, loading } = useProfile();
  const [activeBox, setActiveBox] = useState<string | null>(null);

  const openPricingSection = () => {
    window.open('/#pricing', '_blank');
  };

  const boxes: SectionBox[] = [
    {
      id: 'plan-box',
      title: packageType,
      content: (
        <div className="space-y-2 text-sm text-gray-700">
          <button
            onClick={openPricingSection}
            className="text-xs text-white bg-gray-500 hover:bg-gray-600 px-3 py-1 rounded-xl w-full"
          >
            Upgrade to Smarter
          </button>
          <button
            onClick={openPricingSection}
            className="text-xs text-white bg-purple-700 hover:bg-purple-800 px-3 py-1 rounded-xl w-full"
          >
            Upgrade to Business
          </button>
        </div>
      ),
    },
    {
      id: 'profile-settings',
      title: 'Profile Settings',
      content: (
        <div className="space-y-2 text-sm text-gray-700">
          <a
            href="/settings/profile"
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:text-black"
          >
            Edit Profile
          </a>
          <a
            href="/settings/subscription"
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:text-black"
          >
            Manage Subscription
          </a>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed top-0 right-0 h-full w-80 bg-[#FDFCF9] text-black shadow-xl z-50 p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        {!loading && profile && (
          <p className="text-sm font-semibold text-gray-800">
            Hi, {profile.full_name || 'User'}
          </p>
        )}
        <button onClick={onClose} className="text-gray-600 hover:text-black text-lg">✕</button>
      </div>

      <div
        onClick={() => setActiveBox(prev => (prev === 'plan-box' ? null : 'plan-box'))}
        className={cn(
          'transition-all duration-300 cursor-pointer mb-4 rounded-xl border',
          activeBox === 'plan-box' ? 'border-[#C084FC] bg-gray-50' : 'border-gray-300 bg-white',
          'hover:shadow-sm'
        )}
      >
        <div className="px-4 py-3 flex justify-between items-center">
          <PlanProgressFetcher />
          <span className="text-gray-500 text-xs">{activeBox === 'plan-box' ? '▲' : '▼'}</span>
        </div>
        {activeBox === 'plan-box' && (
          <div className="px-4 pb-4">{boxes[0].content}</div>
        )}
      </div>

      {boxes.slice(1).map((box) => {
        const isActive = activeBox === box.id;
        return (
          <div
            key={box.id}
            onClick={() => setActiveBox(prev => (prev === box.id ? null : box.id))}
            className={cn(
              'transition-all duration-300 cursor-pointer mb-4 rounded-xl border',
              isActive ? 'border-[#C084FC] bg-gray-50' : 'border-gray-300 bg-white',
              'hover:shadow-sm'
            )}
          >
            <div className="px-4 py-3 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-800">{box.title}</span>
              <span className="text-gray-500 text-xs">{isActive ? '▲' : '▼'}</span>
            </div>
            {isActive && (
              <div className="px-4 pb-4">
                {box.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PlanProgressFetcher() {
  const { plan, limits, used, hasReachedLimit } = useUserPlan();

  if (!plan) return <div className="text-xs text-gray-400">Loading plan data...</div>;

  return (
    <div>
      <PlanProgress planName={plan} used={used} total={limits.dailyGenerations} />
      {hasReachedLimit && <p className="text-xs text-red-500 mt-1">Daily Limit Reached</p>}
    </div>
  );
}
