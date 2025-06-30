'use client';

import { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/app/context/AuthProvider';

export default function ProfileSettingsPage() {
  const { supabase, user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (!error && data) {
        setProfile(data);
        setName(data.full_name || '');
      }
      setLoading(false);
    };

    if (user) fetchProfile();
  }, [user, supabase]);

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: name })
      .eq('id', user?.id);

    if (error) {
      setErrorMessage('Failed to save changes.');
    } else {
      setSuccessMessage('Profile updated successfully.');
      setEditingName(false);
    }

    setSaving(false);
  };

  const handleChangePassword = async () => {
    setChangingPassword(true);
    setPasswordMessage(null);

    if (newPassword.length < 6) {
      setPasswordMessage('Password must be at least 6 characters.');
      setChangingPassword(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error('Change password error:', error);
      setPasswordMessage('Failed to change password.');
    } else {
      setPasswordMessage('Password changed successfully.');
      setNewPassword('');
      setShowPasswordForm(false);
    }

    setChangingPassword(false);
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to permanently delete your account? This cannot be undone.'
    );

    if (!confirmed) return;

    setDeleting(true);
    setErrorMessage(null);

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    try {
      const res = await fetch('/api/user/delete', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setErrorMessage('Failed to delete account.');
        setDeleting(false);
        return;
      }

      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (err) {
      console.error('Error deleting account:', err);
      setErrorMessage('An error occurred while deleting your account.');
      setDeleting(false);
    }
  };

  if (loading)
    return <div className="p-8 text-gray-600 text-sm">Loading...</div>;

  return (
    <div
      className="min-h-screen w-full flex justify-center items-start p-4"
      style={{ backgroundColor: '#ffffff' }}
    >
      <div className="w-full max-w-3xl">
        <div className="bg-white rounded-xl shadow-md p-4 md:p-8 w-full">
          <div className="flex items-center mb-8 space-x-4">
            <UserCircleIcon className="h-10 w-10 text-gray-300" />
            <h1 className="text-lg md:text-xl font-bold text-gray-900">
              Edit Profile
            </h1>
          </div>

          <div className="space-y-4 text-sm text-gray-800">
            {/* Name */}
            <div className="flex items-center justify-between">
              {!editingName ? (
                <>
                  <span>
                    <span className="font-medium text-gray-700">Name:</span>{' '}
                    {name || '-'}
                  </span>
                  <button
                    onClick={() => setEditingName(true)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="w-full space-y-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A78BFA] text-sm"
                  />
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="text-xs px-3 py-1 bg-[#A78BFA] hover:bg-[#8B5CF6] text-white rounded-md"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingName(false)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <span className="font-medium text-gray-700">Email:</span>{' '}
              {profile?.email || '-'}
            </div>

            {/* Email Verified */}
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-700">
                Email Verified:
              </span>
              {profile?.email_verified ? (
                <span className="flex items-center text-green-600">
                  <CheckCircleIcon className="h-4 w-4 mr-1" /> Yes
                </span>
              ) : (
                <span className="flex items-center text-red-600">
                  <XCircleIcon className="h-4 w-4 mr-1" /> No
                </span>
              )}
            </div>

            {/* Role */}
            <div>
              <span className="font-medium text-gray-700">Role:</span>{' '}
              {profile?.role || 'user'}
            </div>

            {/* Change Password */}
            {user?.app_metadata?.provider !== 'google' && (
              <div>
                {!showPasswordForm ? (
                  <div className="flex items-center justify-between">
                    <span>
                      <span className="font-medium text-gray-700">
                        Password:
                      </span>{' '}
                      ••••••••
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPasswordForm(true)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="password"
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A78BFA] text-sm"
                    />
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={handleChangePassword}
                        disabled={changingPassword}
                        className="text-xs px-3 py-1 bg-[#A78BFA] hover:bg-[#8B5CF6] text-white rounded-md"
                      >
                        {changingPassword
                          ? 'Changing...'
                          : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setNewPassword('');
                          setPasswordMessage(null);
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                    {passwordMessage && (
                      <p className="text-xs text-gray-700 mt-1">
                        {passwordMessage}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Agreed to Terms */}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={profile?.agreed_to_terms || false}
                readOnly
                className="accent-[#A78BFA] h-4 w-4"
              />
              <span className="ml-2 text-gray-700">
                Agreed to Terms & Conditions
              </span>
            </div>

            {/* Success / Error Messages */}
            {successMessage && (
              <p className="text-green-600 text-xs mt-2">
                {successMessage}
              </p>
            )}
            {errorMessage && (
              <p className="text-red-600 text-xs mt-2">
                {errorMessage}
              </p>
            )}

            {/* Delete Account */}
            <div className="text-center mt-8">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="text-xs text-red-600 hover:text-red-800 underline"
              >
                {deleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
