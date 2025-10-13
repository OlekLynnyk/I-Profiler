'use client';

import { useEffect, useMemo, useState } from 'react';
import { Files, Pencil } from 'lucide-react';
import { useAuth } from '@/app/context/AuthProvider';
import { useInjectPrompt } from '@/app/hooks/useInjectPrompt';
import {
  useTemplates,
  SYS_FOLDERS,
  FOLDER_NAME_LIMIT,
  TEMPLATE_TITLE_LIMIT,
  type TemplateItem,
} from '@/app/hooks/useTemplates';

type TemplatesPanelProps = { isCdrMode?: boolean };

const CDRS = 'CDRs' as const;
const UNGROUPED = '__ungrouped__' as const;

export default function TemplatesPanel({ isCdrMode = false }: TemplatesPanelProps) {
  const { session } = useAuth();
  const userId = session?.user?.id || '';
  const injectPrompt = useInjectPrompt();

  const {
    getTemplateFolders,
    getTemplates,
    createTemplateFolder,
    deleteTemplateFolder,
    createTemplate,
    deleteTemplate,
    duplicateTemplateFromSystem,
    logInsertIntoInput,
    updateTemplate,
  } = useTemplates();

  const [folders, setFolders] = useState<string[]>([]);
  const [items, setItems] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newTplOpen, setNewTplOpen] = useState(false);
  const [newTplTitle, setNewTplTitle] = useState('');
  const [newTplContent, setNewTplContent] = useState('Based on the results of the analysis, ');

  const [editTplOpen, setEditTplOpen] = useState(false);
  const [editTplId, setEditTplId] = useState<string | null>(null);
  const [editTplTitle, setEditTplTitle] = useState('');
  const [editTplContent, setEditTplContent] = useState('');

  useEffect(() => {
    const onCreateFolder = () => setNewFolderOpen(true);
    const onCreateTemplate = () => setNewTplOpen(true);
    window.addEventListener('templates:createFolder', onCreateFolder);
    window.addEventListener('templates:createTemplate', onCreateTemplate);
    return () => {
      window.removeEventListener('templates:createFolder', onCreateFolder);
      window.removeEventListener('templates:createTemplate', onCreateTemplate);
    };
  }, []);

  const refresh = async () => {
    if (!userId) return;
    setLoading(true);
    setErr(null);
    try {
      const [fs, its] = await Promise.all([getTemplateFolders(userId), getTemplates(userId)]);
      setFolders(fs);
      setItems(its);
      setExpanded((prev) => {
        const next = { ...prev };
        for (const f of [...SYS_FOLDERS, ...fs, UNGROUPED]) {
          if (typeof next[f] === 'undefined') next[f] = false;
        }
        return next;
      });
    } catch (e: any) {
      setErr(e?.message || 'Failed to load templates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const grouped = useMemo(() => {
    const map = new Map<string, TemplateItem[]>();
    for (const f of folders) map.set(f, []);
    for (const it of items) {
      const f = it.folder ?? '';
      if (!f) continue;
      if (!map.has(f)) map.set(f, []);
      map.get(f)!.push(it);
    }
    for (const [, arr] of map) arr.sort((a, b) => a.title.localeCompare(b.title));
    return map;
  }, [folders, items]);

  const systemFolders = SYS_FOLDERS as readonly string[];
  const customFolders = useMemo(
    () => folders.filter((f) => !systemFolders.includes(f)),
    [folders, systemFolders]
  );

  const ungroupedUser = useMemo(
    () =>
      items.filter((it) => !it.system && !it.folder).sort((a, b) => a.title.localeCompare(b.title)),
    [items]
  );

  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const handleInsert = async (tpl: TemplateItem) => {
    if ((tpl.folder || '') === CDRS && !isCdrMode) return;
    injectPrompt(tpl.content);
    if (userId) await logInsertIntoInput(userId, tpl.id, !!tpl.system);
  };

  const handleDuplicateSystem = async (tpl: TemplateItem) => {
    if (!userId) return;
    try {
      await duplicateTemplateFromSystem(tpl.id, userId);
      await refresh();
    } catch (e: any) {
      alert(e?.message || 'Failed to duplicate template.');
    }
  };

  const handleOpenEditUserTpl = (tpl: TemplateItem) => {
    if (tpl.system) return;
    setEditTplId(tpl.id);
    setEditTplTitle(tpl.title);
    setEditTplContent(tpl.content ?? '');
    setEditTplOpen(true);
  };

  const submitUpdateTemplate = async () => {
    if (!userId || !editTplId) return;
    const title = (editTplTitle || '').trim();
    if (!title) {
      alert('Template title cannot be empty.');
      return;
    }
    try {
      await updateTemplate(editTplId, userId, { title, content: editTplContent ?? '' });
      setEditTplOpen(false);
      setEditTplId(null);
      setEditTplTitle('');
      setEditTplContent('');
      await refresh();
    } catch (e: any) {
      alert(e?.message || 'Failed to update template.');
    }
  };

  const submitDeleteFromEdit = async () => {
    if (!userId || !editTplId) return;
    const ok = window.confirm('Delete this template?');
    if (!ok) return;
    try {
      await deleteTemplate(editTplId, userId);
      setEditTplOpen(false);
      setEditTplId(null);
      setEditTplTitle('');
      setEditTplContent('');
      await refresh();
    } catch (e: any) {
      alert(e?.message || 'Failed to delete template.');
    }
  };

  const submitCreateFolder = async () => {
    if (!userId) return;
    const name = newFolderName.trim();
    if (!name) {
      alert('Block name cannot be empty.');
      return;
    }
    try {
      await createTemplateFolder(userId, name);
      setNewFolderOpen(false);
      setNewFolderName('');
      await refresh();
    } catch (e: any) {
      alert(e?.message || 'Failed to create block.');
    }
  };

  const submitCreateTemplate = async () => {
    if (!userId) return;
    const title = newTplTitle.trim();
    if (!title) {
      alert('Template title cannot be empty.');
      return;
    }
    try {
      await createTemplate({ user_id: userId, title, content: newTplContent ?? '' });
      setNewTplOpen(false);
      setNewTplTitle('');
      setNewTplContent('Based on the results of the analysis, ');
      await refresh();
    } catch (e: any) {
      alert(e?.message || 'Failed to create template.');
    }
  };

  const Section = ({
    id,
    title,
    children,
    emptyDeletable,
  }: {
    id: string;
    title: string;
    children: React.ReactNode;
    emptyDeletable?: boolean;
  }) => {
    const isEmpty = Array.isArray(children) ? (children as any[]).length === 0 : false;
    return (
      <div>
        <div
          className="flex justify-between items-center px-3 py-1 cursor-pointer no-select tap-ok"
          role="button"
          tabIndex={0}
          draggable={false}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onPointerUp={(e) => e.stopPropagation()}
          onClick={() => toggle(id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') toggle(id);
          }}
        >
          <span className="text-sm text-[var(--text-primary)]">{title}</span>
          <span className="text-[var(--text-secondary)] text-xs pointer-events-none select-none">
            {expanded[id] ? '▲' : '▼'}
          </span>
        </div>
        {expanded[id] && (
          <div>
            {isEmpty ? (
              <div data-templates className="px-3 py-1 flex justify-between items-center">
                <span className="text-xs text-[var(--text-secondary)] italic">
                  This block is empty.
                </span>
                {emptyDeletable && (
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (!userId) return;
                      const ok = window.confirm(`Delete the empty block "${title}"?`);
                      if (!ok) return;
                      try {
                        await deleteTemplateFolder(userId, title);
                        await refresh();
                      } catch (er: any) {
                        alert(er?.message || 'Failed to delete the block. It may not be empty.');
                      }
                    }}
                    className="text-[var(--text-secondary)] hover:text-[var(--danger)] text-sm scale-75"
                    aria-label={`Delete block ${title}`}
                    title="Delete block"
                    type="button"
                  >
                    ✕
                  </button>
                )}
              </div>
            ) : (
              children
            )}
          </div>
        )}
      </div>
    );
  };

  // ==== Обновлённый Row: без state на hover, стабильный клик, клавиатура, CSS-tooltip ====
  const Row = ({ tpl }: { tpl: TemplateItem }) => {
    const gated = (tpl.folder || '') === CDRS && !isCdrMode;

    return (
      <div
        className="group relative flex justify-between items-center px-3 py-1 cursor-pointer no-select"
        onPointerDown={(e) => e.stopPropagation()} // не предотвращаем default; только гасим всплытие
        onPointerUp={(e) => {
          e.stopPropagation();
          if (!gated) handleInsert(tpl);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!gated) handleInsert(tpl);
          }
        }}
        draggable={false}
        data-row
      >
        <span
          onPointerDown={(e) => e.stopPropagation()}
          className={`file-title no-select text-sm transition-colors duration-150 ${
            gated
              ? 'text-[var(--text-secondary)]'
              : 'text-[var(--text-primary)] hover:text-[var(--accent)]'
          }`}
        >
          {tpl.title}
        </span>

        <div className="flex items-center gap-2">
          {tpl.system ? (
            <button
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleDuplicateSystem(tpl);
              }}
              title="Duplicate to My templates"
              aria-label="Duplicate"
              type="button"
            >
              <Files className="w-4 h-4 scale-75" />
            </button>
          ) : (
            <button
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEditUserTpl(tpl);
              }}
              title="Edit"
              aria-label="Edit"
              type="button"
            >
              <Pencil className="w-4 h-4 scale-75" />
            </button>
          )}
        </div>

        {gated && (
          <div
            className="
              pointer-events-none
              absolute left-3 -top-1 translate-y-[-100%]
              opacity-0 group-hover:opacity-100
              transition-opacity duration-150
              px-2 py-1 rounded-md text-[11px]
              bg-[var(--card-bg)] text-[var(--text-secondary)]
              border border-[var(--card-border)] shadow-sm
              max-w-[calc(100%-24px)] whitespace-normal break-words
            "
          >
            Available in CDRs mode. Toggle “CDRs” to use.
          </div>
        )}
      </div>
    );
  };

  if (loading) return <p className="text-sm text-[var(--text-secondary)]">Loading templates…</p>;
  if (err) return <p className="text-sm text-[var(--danger)]">{err}</p>;

  return (
    <div className="flex flex-col gap-1" data-templates>
      {systemFolders.map((name) => (
        <Section key={`sys-${name}`} id={name} title={name}>
          {(grouped.get(name) ?? []).length === 0 ? (
            <div className="px-3 py-1 text-xs text-[var(--text-secondary)] italic">
              No templates yet.
            </div>
          ) : (
            (grouped.get(name) ?? []).map((tpl) => <Row key={tpl.id} tpl={tpl} />)
          )}
        </Section>
      ))}

      {customFolders.map((name) => {
        const arr = grouped.get(name) ?? [];
        return (
          <Section key={`custom-${name}`} id={name} title={name} emptyDeletable>
            {arr.map((tpl) => (
              <Row key={tpl.id} tpl={tpl} />
            ))}
          </Section>
        );
      })}

      <div className="mt-1 pt-1 border-t border-[var(--card-border)]">
        <div className="px-3 py-1 text-xs text-[var(--text-secondary)]">Templates (no folder)</div>
        {ungroupedUser.length === 0 ? (
          <div className="px-3 py-1 text-xs text-[var(--text-secondary)] italic">
            No personal templates yet.
          </div>
        ) : (
          ungroupedUser.map((tpl) => <Row key={tpl.id} tpl={tpl} />)
        )}
      </div>

      {/* Модалки без изменений, только добавлен type="button" где нужно */}
      {newFolderOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="absolute inset-0 z-50 flex items-center justify-center"
          data-modal="open"
          data-interactive="true"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setNewFolderOpen(false);
              setNewFolderName('');
            }}
          />
          <div
            className="relative z-10 w-full max-w-sm bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--card-border)] rounded-2xl p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-medium mb-2">Create a new block</h3>
            <input
              autoFocus
              type="text"
              maxLength={FOLDER_NAME_LIMIT}
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder={`Block name (up to ${FOLDER_NAME_LIMIT} chars)`}
              className="w-full rounded-lg px-3 py-2 text-sm bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
            <div className="mt-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setNewFolderOpen(false);
                  setNewFolderName('');
                }}
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitCreateFolder}
                className="h-8 px-3 rounded-full text-xs font-medium bg-[var(--button-bg)] text-[var(--text-primary)]  dark:bg-[var(--card-bg)] shadow-sm"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {newTplOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="absolute inset-0 z-50 flex items-center justify-center"
          data-modal="open"
          data-interactive="true"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setNewTplOpen(false);
              setNewTplTitle('');
              setNewTplContent('Based on the results of the analysis, ');
            }}
          />
          <div
            className="relative z-10 w-[95vw] max-w-lg bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--card-border)] rounded-2xl p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-medium mb-2">Create a new template</h3>

            <label className="block text-xs text-[var(--text-secondary)] mb-1">
              Title (≤ {TEMPLATE_TITLE_LIMIT})
            </label>
            <input
              autoFocus
              type="text"
              maxLength={TEMPLATE_TITLE_LIMIT}
              value={newTplTitle}
              onChange={(e) => setNewTplTitle(e.target.value)}
              placeholder="Template title"
              className="w-full rounded-lg px-3 py-2 text-sm bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />

            <label className="block text-xs text-[var(--text-secondary)] mt-3 mb-1">Content</label>
            <textarea
              value={newTplContent}
              onChange={(e) => setNewTplContent(e.target.value)}
              rows={6}
              className="w-full rounded-lg px-3 py-2 text-sm bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />

            <div className="mt-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setNewTplOpen(false);
                  setNewTplTitle('');
                  setNewTplContent('Based on the results of the analysis, ');
                }}
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitCreateTemplate}
                className="h-8 px-3 rounded-full text-xs font-medium bg-[var(--button-bg)] text-[var(--text-primary)]  dark:bg-[var(--card-bg)] shadow-sm"
              >
                Create template
              </button>
            </div>
          </div>
        </div>
      )}

      {editTplOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="absolute inset-0 z-50 flex items-center justify-center"
          data-modal="open"
          data-interactive="true"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setEditTplOpen(false);
              setEditTplId(null);
              setEditTplTitle('');
              setEditTplContent('');
            }}
          />
          <div
            className="relative z-10 w-[95vw] max-w-lg bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--card-border)] rounded-2xl p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-medium mb-2">Edit template</h3>

            <label className="block text-xs text-[var(--text-secondary)] mb-1">
              Title (≤ {TEMPLATE_TITLE_LIMIT})
            </label>
            <input
              autoFocus
              type="text"
              maxLength={TEMPLATE_TITLE_LIMIT}
              value={editTplTitle}
              onChange={(e) => setEditTplTitle(e.target.value)}
              placeholder="Template title"
              className="w-full rounded-lg px-3 py-2 text-sm bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />

            <label className="block text-xs text-[var(--text-secondary)] mt-3 mb-1">Content</label>
            <textarea
              value={editTplContent}
              onChange={(e) => setEditTplContent(e.target.value)}
              rows={6}
              className="w-full rounded-lg px-3 py-2 text-sm bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />

            <div className="mt-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditTplOpen(false);
                  setEditTplId(null);
                  setEditTplTitle('');
                  setEditTplContent('');
                }}
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitDeleteFromEdit}
                className="h-8 px-3 rounded-full text-xs font-medium bg-[var(--button-bg)] text-[var(--danger)]  dark:bg-[var(--card-bg)] shadow-sm"
                title="Delete this template"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={submitUpdateTemplate}
                className="h-8 px-3 rounded-full text-xs font-medium bg-[var(--button-bg)] text-[var(--text-primary)]  dark:bg-[var(--card-bg)] shadow-sm"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
