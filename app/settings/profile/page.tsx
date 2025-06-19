'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthProvider';

export default function ProfileSettingsPage() {
  const { supabase, user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (!error && data) setProfile(data);
      setLoading(false);
    };

    if (user) fetchProfile();
  }, [user, supabase]);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Edit Profile</h1>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            defaultValue={profile?.full_name || ''}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={profile?.email || ''}
            readOnly
            className="mt-1 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700">Email Verified:</p>
            <p className={profile?.email_verified ? 'text-green-600' : 'text-red-600'}>
              {profile?.email_verified ? 'Yes' : 'No'}
            </p>
          </div>
          {!profile?.email_verified && (
            <button className="text-sm text-purple-600 underline">Resend Verification</button>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <input
            type="text"
            value={profile?.role || 'user'}
            readOnly
            className="mt-1 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        {user?.app_metadata?.provider !== 'google' && (
          <div>
            <button className="text-sm text-blue-600 underline">Change Password</button>
          </div>
        )}

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={profile?.agreed_to_terms || false}
            readOnly
            className="mr-2"
          />
          <span className="text-sm">Agreed to Terms & Conditions</span>
        </div>

        <div className="mt-6">
          <button className="text-sm text-red-600 underline">Delete Account</button>
        </div>
      </div>
    </div>
  );
}
