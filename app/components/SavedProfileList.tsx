'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthProvider';
import { useSavedProfiles, SavedProfile } from '@/app/hooks/useSavedProfiles';
import SaveProfileModal from '@/app/components/SaveProfileModal';

export default function SavedProfileList() {
  const { session } = useAuth();
  const { getSavedProfiles, deleteProfile, updateProfile } = useSavedProfiles();

  const [profiles, setProfiles] = useState<SavedProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<SavedProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;

    let isActive = true;
    setLoading(true);

    getSavedProfiles(session.user.id)
      .then((data) => {
        if (isActive) {
          setProfiles(data);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch saved profiles', error);
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [session?.user?.id]);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this profile?');
    if (!confirmed) return;

    try {
      await deleteProfile(id);
      setProfiles((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Failed to delete profile', error);
      alert('Failed to delete the profile. Please try again.');
    }
  };

  const handleUpdate = async (id: string, name: string, aiResponse: string, comments: string) => {
    try {
      await updateProfile(id, {
        profile_name: name,
        chat_json: {
          ai_response: aiResponse,
          user_comments: comments,
        },
      });

      setSelectedProfile(null);

      if (session?.user?.id) {
        const updated = await getSavedProfiles(session.user.id);
        setProfiles(updated);
      }
    } catch (error) {
      console.error('Failed to update profile', error);
      alert('Failed to update the profile. Please try again.');
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {loading ? (
        <p className="text-sm text-[var(--text-secondary)]">Loading saved reports…</p>
      ) : profiles.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)] italic">No saved reports yet.</p>
      ) : (
        profiles.map((profile) => (
          <div
            key={profile.id}
            className="flex justify-between items-center px-3 py-1 hover:bg-[var(--surface)] transition cursor-pointer"
          >
            <span
              onClick={(e) => {
                e.stopPropagation();
                setSelectedProfile(profile);
              }}
              className="text-sm text-[var(--text-primary)] hover:text-[var(--accent)]"
            >
              {profile.profile_name}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation(); // ← не даём клику дойти до SidebarBox (не схлопываем блок)
                e.preventDefault();
                handleDelete(profile.id); // ← удаляем
              }}
              className="text-[var(--text-secondary)] hover:text-[var(--danger)] text-sm"
            >
              ✕
            </button>
          </div>
        ))
      )}

      {selectedProfile && (
        <SaveProfileModal
          open={true}
          onClose={() => setSelectedProfile(null)}
          aiResponse={selectedProfile.chat_json.ai_response}
          onSave={async (name, aiResponse, comments) => {
            await handleUpdate(selectedProfile.id, name, aiResponse, comments);
          }}
          defaultProfileName={selectedProfile.profile_name}
          readonly={false}
        />
      )}
    </div>
  );
}
