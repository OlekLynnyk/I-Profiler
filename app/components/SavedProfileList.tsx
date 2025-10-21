'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/app/context/AuthProvider';
import { useSavedProfiles, SavedProfile, SavedBlockName } from '@/app/hooks/useSavedProfiles';
import SaveProfileModal from '@/app/components/SaveProfileModal';

type SavedProfileListProps = {
  selectionMode?: boolean;
  onSelectForCdr?: (profile: SavedProfile) => void;
  showCreateBlockButton?: boolean;
  preselectedIds?: string[];
};

const CDRS_ID = 'CDRs' as const;
const UNGROUPED_ID = '__ungrouped__' as const;
const MAX_CUSTOM_BLOCKS = 15;
const MAX_BLOCK_NAME_LEN = 30;

export default function SavedProfileList({
  selectionMode = false,
  onSelectForCdr,
  showCreateBlockButton = false,
  preselectedIds = [],
}: SavedProfileListProps) {
  console.debug('[SavedProfileList] selectionMode =', selectionMode);
  const { session } = useAuth();
  const userId = session?.user?.id;

  const { getSavedProfiles, deleteProfile, updateProfile, getFolders, createFolder, deleteFolder } =
    useSavedProfiles();

  const [profiles, setProfiles] = useState<SavedProfile[]>([]);
  const [folders, setFolders] = useState<SavedBlockName[]>([CDRS_ID]);
  const [selectedProfile, setSelectedProfile] = useState<SavedProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    [CDRS_ID]: false,
    [UNGROUPED_ID]: false,
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (selectionMode) {
      setSelectedIds(new Set(preselectedIds));
    } else {
      setSelectedIds(new Set());
    }
  }, [selectionMode, preselectedIds]);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newBlockName, setNewBlockName] = useState('');
  const [createErr, setCreateErr] = useState<string | null>(null);

  const cdrsItems = useMemo(() => profiles.filter((p) => p.folder === CDRS_ID), [profiles]);

  const groupedByFolder = useMemo(() => {
    const map = new Map<string, SavedProfile[]>();
    for (const p of profiles) {
      const f = (p.folder ?? '') as string;
      if (!f || f === CDRS_ID) continue;
      if (!map.has(f)) map.set(f, []);
      map.get(f)!.push(p);
    }
    return map;
  }, [profiles]);

  const ungrouped = useMemo(() => profiles.filter((p) => !p.folder), [profiles]);

  // Фоновый refresh (без мигания)
  const refresh = async () => {
    if (!userId) return;
    try {
      const [items, folderList] = await Promise.all([getSavedProfiles(userId), getFolders(userId)]);
      setProfiles(items);
      const ordered = Array.from(new Set([CDRS_ID, ...folderList.filter((n) => n !== CDRS_ID)]));
      setFolders(ordered);
      setExpanded((prev) => {
        const next: Record<string, boolean> = { ...prev };
        for (const f of ordered) {
          if (typeof next[f] === 'undefined') next[f] = false;
        }
        if (typeof next[UNGROUPED_ID] === 'undefined') next[UNGROUPED_ID] = false;
        return next;
      });
    } catch (e) {
      console.error('Failed to fetch saved profiles/folders', e);
    }
  };

  // Первичная загрузка
  useEffect(() => {
    if (!userId) return;
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const [items, folderList] = await Promise.all([
          getSavedProfiles(userId),
          getFolders(userId),
        ]);
        if (!active) return;
        setProfiles(items);
        const ordered = Array.from(new Set([CDRS_ID, ...folderList.filter((n) => n !== CDRS_ID)]));
        setFolders(ordered);
        setExpanded((prev) => {
          const next: Record<string, boolean> = { ...prev };
          for (const f of ordered) {
            if (typeof next[f] === 'undefined') next[f] = false;
          }
          if (typeof next[UNGROUPED_ID] === 'undefined') next[UNGROUPED_ID] = false;
          return next;
        });
      } catch (e) {
        console.error('Failed to fetch saved profiles/folders', e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Глобальные события
  useEffect(() => {
    const handler = () => setCreateModalOpen(true);
    window.addEventListener('savedMessages:createBlock', handler as EventListener);
    return () => window.removeEventListener('savedMessages:createBlock', handler as EventListener);
  }, []);

  useEffect(() => {
    const onRefresh = () => refresh();
    window.addEventListener('savedMessages:refresh', onRefresh as EventListener);
    return () => window.removeEventListener('savedMessages:refresh', onRefresh as EventListener);
  }, [userId]);

  const handleDelete = async (id: string) => {
    if (selectionMode) return;
    const confirmed = window.confirm('Are you sure you want to delete this profile?');
    if (!confirmed) return;
    try {
      setSelectedProfile(null);
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
      await refresh();
    } catch (error) {
      console.error('Failed to update profile', error);
      alert('Failed to update the profile. Please try again.');
    }
  };

  const handleCreateBlock = async () => {
    if (!userId) return;
    const name = newBlockName.trim();
    setCreateErr(null);

    const customCount = folders.filter((f) => f !== CDRS_ID).length;
    if (customCount >= MAX_CUSTOM_BLOCKS) {
      setCreateErr(`You can create up to ${MAX_CUSTOM_BLOCKS} blocks.`);
      return;
    }
    if (!name) {
      setCreateErr('Block name cannot be empty.');
      return;
    }
    if (name.length > MAX_BLOCK_NAME_LEN) {
      setCreateErr(`Please use a shorter name (≤ ${MAX_BLOCK_NAME_LEN} characters).`);
      return;
    }
    if (name === CDRS_ID || name === UNGROUPED_ID) {
      setCreateErr('This block name is reserved.');
      return;
    }
    if (folders.includes(name)) {
      setCreateErr('This block name already exists.');
      return;
    }

    try {
      await createFolder(userId, name);
      const fs = await getFolders(userId);
      setFolders([CDRS_ID, ...fs.filter((n) => n !== CDRS_ID)]);
      setNewBlockName('');
      setCreateModalOpen(false);
    } catch (err: any) {
      setCreateErr(err?.message || 'Failed to create the block.');
    }
  };

  const handleDeleteFolder = async (folderName: string) => {
    if (selectionMode) return;
    if (!userId) return;

    const confirmed = window.confirm(`Delete the empty block "${folderName}"?`);
    if (!confirmed) return;

    try {
      await deleteFolder(userId, folderName);
      setFolders((prev) => prev.filter((f) => f !== folderName));
      setExpanded((prev) => {
        const next = { ...prev };
        delete next[folderName];
        return next;
      });
    } catch (e) {
      console.error('Failed to delete folder', e);
      alert('Failed to delete the block. It may not be empty.');
    }
  };

  const toggleExpanded = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  /**
   * Заголовок секции (уровень 2): стабильный pointerup-триггер + порог движения
   */
  const SectionHeader = ({ title, id }: { title: string; id: string }) => {
    const startRef = useRef<{ x: number; y: number } | null>(null);
    const movedRef = useRef(false);
    const panelId = `saved-sec-${id}`;

    return (
      <div
        className="flex justify-between items-center px-3 py-1 cursor-pointer no-select tap-ok leading-5 min-h-[24px]"
        role="button"
        tabIndex={0}
        aria-expanded={!!expanded[id]}
        aria-controls={panelId}
        draggable={false}
        onPointerDown={(e) => {
          e.stopPropagation(); // НЕ делаем preventDefault — иначе click может не родиться
          startRef.current = { x: e.clientX, y: e.clientY };
          movedRef.current = false;
        }}
        onPointerMove={(e) => {
          if (!startRef.current) return;
          const dx = Math.abs(e.clientX - startRef.current.x);
          const dy = Math.abs(e.clientY - startRef.current.y);
          if (dx > 3 || dy > 3) movedRef.current = true;
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          startRef.current = null;
          if (movedRef.current) return; // скролл/drag — не переключаем
          toggleExpanded(id);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleExpanded(id);
          }
          if (e.key === 'Escape' && expanded[id]) {
            e.preventDefault();
            toggleExpanded(id);
          }
        }}
        title={id === CDRS_ID ? "You can't move items into CDRs." : undefined}
      >
        <span className="text-sm text-[var(--text-primary)]">{title}</span>
        <span className="text-[var(--text-secondary)] text-xs pointer-events-none select-none">
          {expanded[id] ? '▲' : '▼'}
        </span>
      </div>
    );
  };

  /**
   * Строка (уровень 3): pointerup-триггер с порогом + stopPropagation.
   * В selectionMode открытие модалки не выполняем.
   */
  const Row = ({ profile }: { profile: SavedProfile }) => {
    const checked = selectedIds.has(profile.id);
    const startRef = useRef<{ x: number; y: number } | null>(null);
    const movedRef = useRef(false);

    return (
      <div
        data-row
        role="button"
        tabIndex={0}
        aria-label={profile.profile_name}
        className="flex justify-between items-center px-3 py-1 cursor-pointer no-select tap-ok leading-5 min-h-[24px]"
        style={{ willChange: 'transform' }}
        onPointerDown={(e) => {
          e.stopPropagation();
          startRef.current = { x: e.clientX, y: e.clientY };
          movedRef.current = false;
        }}
        onPointerMove={(e) => {
          if (!startRef.current) return;
          const dx = Math.abs(e.clientX - startRef.current.x);
          const dy = Math.abs(e.clientY - startRef.current.y);
          if (dx > 3 || dy > 3) movedRef.current = true;
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          startRef.current = null;
          if (movedRef.current) return;
          if (selectionMode) return; // выбор через чекбокс
          // Открываем модалку на следующий тик, чтобы overlay не закрывал её тем же событием
          setTimeout(() => setSelectedProfile(profile), 0);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!selectionMode) setTimeout(() => setSelectedProfile(profile), 0);
          }
        }}
        draggable={false}
      >
        <span
          className="file-title no-select select-none text-sm text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors duration-150"
          draggable={false}
          style={{ willChange: 'color' }}
        >
          {profile.profile_name}
        </span>

        {selectionMode && (
          <input
            type="checkbox"
            checked={checked}
            readOnly
            onClick={(e) => {
              e.stopPropagation();
              const next = new Set(selectedIds);
              if (!checked) next.add(profile.id);
              else next.delete(profile.id);
              setSelectedIds(next);
              onSelectForCdr?.(profile);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            className="accent-[var(--accent)]"
            aria-label="Select for CDRs"
            aria-checked={checked}
          />
        )}

        {!selectionMode && (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(profile.id);
            }}
            className="text-[var(--text-secondary)] hover:text-[var(--danger)] text-sm scale-75"
            aria-label="Delete saved profile"
            title="Delete"
            type="button"
          >
            ✕
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return <p className="text-sm text-[var(--text-secondary)]">Loading saved reports…</p>;
  }

  if (profiles.length === 0) {
    return <p className="text-sm text-[var(--text-secondary)] italic">No saved reports yet.</p>;
  }

  return (
    <div className="flex flex-col gap-1" data-cdr-selection={selectionMode ? 'on' : 'off'}>
      <SectionHeader title="Combined Discernment Reports" id={CDRS_ID} />
      {expanded[CDRS_ID] && (
        <div id={`saved-sec-${CDRS_ID}`}>
          {cdrsItems.length === 0 ? (
            <div className="px-3 py-1 text-xs text-[var(--text-secondary)] italic">
              No CDRs yet. Try the CDRs feature.
            </div>
          ) : (
            cdrsItems.map((p) => <Row key={p.id} profile={p} />)
          )}
        </div>
      )}

      {folders
        .filter((f) => f !== CDRS_ID)
        .map((folderName) => {
          const items = groupedByFolder.get(folderName) || [];
          return (
            <div key={`folder-${folderName}`}>
              <SectionHeader title={folderName} id={folderName} />
              {expanded[folderName] && (
                <div id={`saved-sec-${folderName}`}>
                  {items.length === 0 ? (
                    <div className="px-3 py-1 flex justify-between items-center">
                      <span className="text-xs text-[var(--text-secondary)] italic">
                        This block is empty.
                      </span>
                      {!selectionMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFolder(folderName);
                          }}
                          className="text-[var(--text-secondary)] hover:text-[var(--danger)] text-sm scale-75"
                          aria-label={`Delete block ${folderName}`}
                          title="Delete block"
                          type="button"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ) : (
                    items.map((p) => <Row key={p.id} profile={p} />)
                  )}
                </div>
              )}
            </div>
          );
        })}

      <div className="mt-1 pt-1 border-t border-[var(--card-border)]">
        {ungrouped.length === 0 ? (
          <div className="px-3 py-1 text-xs text-[var(--text-secondary)] italic">
            No saved reports yet.
          </div>
        ) : (
          ungrouped.map((p) => <Row key={p.id} profile={p} />)
        )}
      </div>

      {selectedProfile && !selectionMode && (
        <SaveProfileModal
          open={true}
          onClose={() => setSelectedProfile(null)}
          aiResponse={selectedProfile.chat_json.ai_response}
          onSave={async (name, aiResponse, comments, _selectedFolder) => {
            await handleUpdate(selectedProfile.id, name, aiResponse, comments);
          }}
          defaultProfileName={selectedProfile.profile_name}
          readonly={false}
          folders={folders.filter((f) => f !== CDRS_ID)}
        />
      )}

      {createModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="absolute inset-0 z-50 flex items-center justify-center"
          data-modal="open"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onMouseDown={() => {
              setCreateModalOpen(false);
              setNewBlockName('');
              setCreateErr(null);
            }}
          />
          <div
            className="
              relative z-10 w-full max-w-sm
              bg-[var(--card-bg)] text-[var(--text-primary)]
              border border-[var(--card-border)]
              rounded-2xl p-4 shadow-xl
            "
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-medium mb-2">Create a new block</h3>
            <input
              autoFocus
              type="text"
              maxLength={MAX_BLOCK_NAME_LEN}
              value={newBlockName}
              onChange={(e) => setNewBlockName(e.target.value)}
              placeholder="Block name (up to 30 chars)"
              className="
                w-full rounded-lg px-3 py-2 text-sm
                bg-[var(--surface)] text-[var(--text-primary)]
                focus:outline-none focus:ring-1 focus:ring-[var(--accent)]
              "
            />
            {createErr && <p className="mt-2 text-xs text-[var(--danger)]">{createErr}</p>}
            <div className="mt-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setCreateModalOpen(false);
                  setNewBlockName('');
                  setCreateErr(null);
                }}
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateBlock}
                className="
                  h-8 px-3 rounded-full text-xs font-medium
                  bg-[var(--button-bg)] text-[var(--text-primary)]
                  hover:bg-[var(--button-hover-bg)] dark:bg-[var(--card-bg)]
                  shadow-sm
                "
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
