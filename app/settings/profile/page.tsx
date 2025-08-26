'use client';

import { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '@/app/context/AuthProvider';

const ACCENT = '#A855F7';

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

  const reduce = useReducedMotion();

  useEffect(() => {
    document.title = 'H1NTED · Profile Settings';
  }, []);

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
        headers: { Authorization: `Bearer ${token}` },
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

  if (loading) return <div className="p-8 text-white/60 text-sm">Loading…</div>;

  return (
    <div className="min-h-screen w-full bg-[#1A1E23] text-white">
      <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
        {/* верхний мягкий glow */}
        <div
          aria-hidden
          className="pointer-events-none -mb-6 mx-auto h-[120px] w-[min(680px,90%)] rounded-[999px] bg-white/5 blur-2xl"
        />

        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 10 }}
          animate={reduce ? undefined : { opacity: 1, y: 0, transition: { duration: 0.5 } }}
          className="relative rounded-3xl bg-white/5 backdrop-blur ring-1 ring-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.35)] p-5 md:p-8"
        >
          {/* hairline сверху */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] rounded-t-3xl bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          {/* шапка */}
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-[#A855F7]/30 bg-[#A855F7]/15">
              <UserCircleIcon className="h-6 w-6 text-[#E9D5FF]" />
            </div>
            <h1 className="text-lg md:text-xl font-extrabold tracking-tight">Edit Profile</h1>
          </div>

          <div className="space-y-6 text-sm">
            {/* Name */}
            <div>
              <div className="flex items-center justify-between gap-3">
                {!editingName ? (
                  <>
                    <span className="text-white/80">
                      <span className="font-medium text-white/90">Name:</span>{' '}
                      <span className="text-white">{name || '-'}</span>
                    </span>
                    <button
                      onClick={() => setEditingName(true)}
                      className="rounded-md px-2 py-1 text-white/70 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60"
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
                      className="w-full rounded-md border ring-1 ring-[#E7E5DD] border-transparent bg-white/90 text-[#111827] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-full px-4 py-2 text-[#111827] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60 transition-[transform,box-shadow,background] active:scale-[0.99]"
                        style={{
                          backgroundImage: `
                            radial-gradient(120% 120% at 50% 0%, rgba(168,85,247,0.24) 0%, rgba(168,85,247,0) 60%),
                            linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.88))
                          `,
                          boxShadow:
                            'inset 0 2px 0 rgba(255,255,255,0.6), 0 8px 28px rgba(0,0,0,0.10)',
                          border: '1px solid rgba(168,85,247,0.35)',
                        }}
                      >
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingName(false)}
                        className="rounded-full px-4 py-2 text-white/80 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 border-t border-white/10" />
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <div>
                <span className="font-medium text-white/90">Email:</span>{' '}
                <span className="text-white/80">{profile?.email || '-'}</span>
              </div>

              {/* Email Verified */}
              <div className="flex items-center gap-2">
                <span className="font-medium text-white/90">Email Verified:</span>
                {profile?.email_verified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-xs text-green-300 ring-1 ring-green-400/20">
                    <CheckCircleIcon className="h-4 w-4" /> Yes
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-300 ring-1 ring-red-400/20">
                    <XCircleIcon className="h-4 w-4" /> No
                  </span>
                )}
              </div>

              <div className="mt-4 border-t border-white/10" />
            </div>

            {/* Role */}
            <div>
              <span className="font-medium text-white/90">Role:</span>{' '}
              <span className="text-white/80">{profile?.role || 'user'}</span>
              <div className="mt-4 border-t border-white/10" />
            </div>

            {/* Change Password */}
            {user?.app_metadata?.provider !== 'google' && (
              <div>
                {!showPasswordForm ? (
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">
                      <span className="font-medium text-white/90">Password:</span> ••••••••
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPasswordForm(true)}
                      className="rounded-md px-2 py-1 text-white/70 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60"
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
                      className="w-full rounded-md border ring-1 ring-[#E7E5DD] border-transparent bg-white/90 text-[#111827] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleChangePassword}
                        disabled={changingPassword}
                        className="rounded-full px-4 py-2 text-[#111827] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60 transition-[transform,box-shadow,background] active:scale-[0.99]"
                        style={{
                          backgroundImage: `
                            radial-gradient(120% 120% at 50% 0%, rgba(168,85,247,0.24) 0%, rgba(168,85,247,0) 60%),
                            linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.88))
                          `,
                          boxShadow:
                            'inset 0 2px 0 rgba(255,255,255,0.6), 0 8px 28px rgba(0,0,0,0.10)',
                          border: '1px solid rgba(168,85,247,0.35)',
                        }}
                      >
                        {changingPassword ? 'Changing…' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setNewPassword('');
                          setPasswordMessage(null);
                        }}
                        className="rounded-full px-4 py-2 text-white/80 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60"
                      >
                        Cancel
                      </button>
                    </div>
                    {passwordMessage && (
                      <p className="text-xs text-white/70 mt-1">{passwordMessage}</p>
                    )}
                  </div>
                )}
                <div className="mt-4 border-t border-white/10" />
              </div>
            )}

            {/* Agreed to Terms */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={profile?.agreed_to_terms || false}
                readOnly
                className="h-4 w-4 accent-[#A78BFA]"
              />
              <span className="text-white/80">Agreed to Terms &amp; Conditions</span>
            </div>

            {/* Messages */}
            {successMessage && <p className="text-xs text-emerald-300/90">{successMessage}</p>}
            {errorMessage && <p className="text-xs text-red-300/90">{errorMessage}</p>}

            {/* Delete Account */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-red-200 ring-1 ring-red-400/20 bg-red-500/10 hover:bg-red-500/15 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40 disabled:opacity-60"
              >
                <TrashIcon className="h-4 w-4" />
                {deleting ? 'Deleting…' : 'Delete Account'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
