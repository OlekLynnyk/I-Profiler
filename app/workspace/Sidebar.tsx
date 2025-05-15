'use client';

import React, { useState, type ReactNode } from 'react';
import { useProfile } from '../hooks/useProfile';
import { PackageType } from '@/types/plan';

type SidebarProps = {
  onClose: () => void;
  packageType: PackageType;
};

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

type SectionBox = {
  id: string;
  title: string;
  imageUrl: string;
  content: ReactNode;
};

export default function Sidebar({ onClose, packageType }: SidebarProps) {
  const { profile, loading } = useProfile();
  const [activeBox, setActiveBox] = useState<string | null>(null);

  const boxes: SectionBox[] = [
    {
      id: 'your-plan',
      title: 'Your Plan',
      imageUrl:
        'https://images.unsplash.com/photo-1695826637411-5d92c45a5b14?q=80&w=2062&auto=format&fit=crop',
      content: (
        <div>
          <p className="text-sm text-gray-500">Plan Type:</p>
          <p className="text-lg font-bold">{packageType}</p>
        </div>
      ),
    },
    {
      id: 'profile-settings',
      title: 'Profile Settings',
      imageUrl:
        'https://images.unsplash.com/photo-1501139083538-0139583c060f?q=80&w=2069&auto=format&fit=crop',
      content: (
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="hover:text-black cursor-pointer">Edit Profile</li>
          <li className="hover:text-black cursor-pointer">Account Settings</li>
        </ul>
      ),
    },
    {
      id: 'ai-settings',
      title: 'AI Settings',
      imageUrl:
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop',
      content: (
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="hover:text-black cursor-pointer">Custom Prompts</li>
          <li className="hover:text-black cursor-pointer">Model Preferences</li>
        </ul>
      ),
    },
    {
      id: 'analytics',
      title: 'Analytics',
      imageUrl:
        'https://images.unsplash.com/photo-1573164574396-f0c5e6b76b2c?q=80&w=2070&auto=format&fit=crop',
      content: (
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="hover:text-black cursor-pointer">Usage Stats</li>
          <li className="hover:text-black cursor-pointer">Export Data</li>
        </ul>
      ),
    },
    {
      id: 'subscription',
      title: 'Subscription',
      imageUrl:
        'https://images.unsplash.com/photo-1591696205602-2f950c417cb9?q=80&w=2070&auto=format&fit=crop',
      content: (
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="hover:text-black cursor-pointer">Upgrade Plan</li>
          <li className="hover:text-black cursor-pointer">Billing History</li>
        </ul>
      ),
    },
  ];

  return (
    <div className="fixed top-0 right-0 h-full w-80 bg-[#FDFCF9] text-black shadow-xl z-50 p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Settings</h2>
        <button onClick={onClose} className="text-gray-600 hover:text-black text-lg">✕</button>
      </div>

      {/* Профиль вверху отдельно */}
      {!loading && profile && (
        <div className="mb-4">
          <p className="text-sm text-gray-400">Signed in as</p>
          <p className="font-medium text-black">{profile.full_name || 'Unnamed'}</p>
          <p className="text-sm text-gray-500">{profile.email}</p>
          <p className="text-xs mt-1 text-green-500">
            {profile.email_verified ? 'Email Verified' : 'Email Not Verified'}
          </p>
          <p className="text-xs mt-1 text-blue-500">Role: {profile.role}</p>
        </div>
      )}

      {boxes.map((box) => {
        const isActive = activeBox === box.id;

        return (
          <div
            key={box.id}
            onClick={() => setActiveBox((prev) => (prev === box.id ? null : box.id))}
            className={cn(
              'transition-all duration-300 ease-in-out cursor-pointer mb-4 rounded-xl overflow-hidden border',
              isActive ? 'border-[#C084FC] h-64' : 'border-gray-300 h-28',
              'hover:shadow-md'
            )}
          >
            <div className="flex h-full">
              <div className="w-1/3 p-3 flex items-center text-sm text-gray-800 font-medium">
                {box.title}
              </div>
              <div
                className="w-2/3 h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${box.imageUrl})` }}
              />
            </div>

            {isActive && (
              <div className="p-3 text-xs text-gray-700 bg-gray-50 border-t border-gray-200">
                {box.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
