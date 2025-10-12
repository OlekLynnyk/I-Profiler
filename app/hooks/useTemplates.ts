'use client';

import { useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { logUserAction } from '@/lib/logger';

// Локальный «рас-типизированный» клиент только для этого хука
const sb = supabase as unknown as SupabaseClient<any>;

/* ────────────────────────────────────────────────────────────────────────────
 * Types (локальные модели строк БД)
 * ──────────────────────────────────────────────────────────────────────────── */

export type TemplateFolderName = string;

export type TemplateItem = {
  id: string;
  user_id: string | null; // null => system
  system: boolean;
  title: string;
  content: string;
  folder: string | null;
  created_at: string;
  updated_at: string;
};

export type TemplateInput = {
  user_id: string;
  title: string;
  content: string;
  folder?: string | null; // новые создаём вне папки, поле игнорим
};

type TFolderRow = { name: string; order: number | null };
type TItemRow = {
  id: string;
  user_id: string | null;
  system: boolean;
  title: string;
  content: string;
  folder: string | null;
  created_at: string;
  updated_at: string;
};

/* ────────────────────────────────────────────────────────────────────────────
 * Constants / Limits
 * ──────────────────────────────────────────────────────────────────────────── */

export const SYS_FOLDERS = [
  'General',
  'Human resources (HR)',
  'Team leadership',
  'Sales',
  'CDRs',
] as const;

export const MAX_CUSTOM_FOLDERS = 5;
export const FOLDER_NAME_LIMIT = 30;
export const TEMPLATE_TITLE_LIMIT = 30;

/* ────────────────────────────────────────────────────────────────────────────
 * Hook
 * ──────────────────────────────────────────────────────────────────────────── */

export function useTemplates() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Helpers */

  const isSystemFolder = (name: string | null | undefined) =>
    !!name && SYS_FOLDERS.includes(name as (typeof SYS_FOLDERS)[number]);

  const validateFolderName = (name: string, existing: string[]) => {
    const trimmed = (name || '').trim();
    if (!trimmed) throw new Error('Block name cannot be empty.');
    if (trimmed.length > FOLDER_NAME_LIMIT)
      throw new Error(`Block name is too long (>${FOLDER_NAME_LIMIT}).`);
    if (SYS_FOLDERS.includes(trimmed as any)) throw new Error('This block name is reserved.');
    if (existing.includes(trimmed)) throw new Error('Block with this name already exists.');
    return trimmed;
  };

  const buildDuplicateTitle = async (userId: string, base: string) => {
    const prefix = 'My copy';
    const sep = ' — ';
    const { data } = await sb
      .from('template_items')
      .select('title')
      .eq('user_id', userId)
      .like('title', `${prefix}%${sep}${base}%`);

    const rows = (data ?? []) as Array<{ title: string }>;
    const existing = new Set(rows.map((r) => r.title));

    if (!existing.has(`${prefix} — ${base}`)) return `${prefix} — ${base}`;
    let n = 2;
    while (n < 999) {
      const candidate = `${prefix} (${n}) — ${base}`;
      if (!existing.has(candidate)) return candidate;
      n++;
    }
    return `${prefix} — ${base}`;
  };

  /* Read */

  /** Список папок: системные (в фиксированном порядке) + кастомные пользователя. */
  const getTemplateFolders = async (userId: string): Promise<TemplateFolderName[]> => {
    setError(null);

    // system folders
    const sysQ = await sb
      .from('template_folders')
      .select('name, "order"')
      .is('user_id', null)
      .eq('system', true)
      .order('order', { ascending: true });

    if (sysQ.error) {
      setError(sysQ.error.message);
      return [...SYS_FOLDERS];
    }
    const sys = (sysQ.data ?? []) as TFolderRow[];

    // user custom folders
    const custQ = await sb
      .from('template_folders')
      .select('name, "order"')
      .eq('system', false)
      .eq('user_id', userId)
      .order('order', { ascending: true, nullsFirst: false })
      .order('name', { ascending: true });

    if (custQ.error) {
      setError(custQ.error.message);
      return sys.map((r) => r.name);
    }
    const custom = (custQ.data ?? []) as TFolderRow[];

    return [...sys.map((r) => r.name), ...custom.map((r) => r.name)];
  };

  /** Список темплейтов: системные + пользовательские. */
  const getTemplates = async (userId: string): Promise<TemplateItem[]> => {
    setIsLoading(true);
    setError(null);

    const res = await sb
      .from('template_items')
      .select('*')
      .or(`system.eq.true,user_id.eq.${userId}`)
      .order('system', { ascending: false })
      .order('folder', { ascending: true })
      .order('title', { ascending: true });

    setIsLoading(false);

    if (res.error) {
      setError(res.error.message);
      return [];
    }
    return (res.data ?? []) as TItemRow[] as TemplateItem[];
  };

  /* Folders CRUD */

  const createTemplateFolder = async (userId: string, name: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    // лимит пользовательских папок
    const cntQ = await sb
      .from('template_folders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('system', false);

    if (cntQ.error) {
      setIsLoading(false);
      setError(cntQ.error.message);
      throw cntQ.error;
    }
    const count = cntQ.count ?? 0;
    if (count >= MAX_CUSTOM_FOLDERS) {
      setIsLoading(false);
      throw new Error(`Limit reached (${MAX_CUSTOM_FOLDERS}).`);
    }

    // уникальность имени
    const allFolders = await getTemplateFolders(userId);
    const existingCustom = allFolders.filter((n) => !SYS_FOLDERS.includes(n as any));
    const valid = validateFolderName(name, existingCustom);

    // следующий order
    const orderQ = await sb
      .from('template_folders')
      .select('order')
      .eq('user_id', userId)
      .eq('system', false)
      .order('order', { ascending: false })
      .limit(1);

    const maxOrderRows = (orderQ.data ?? []) as Array<{ order: number | null }>;
    const nextOrder =
      maxOrderRows.length > 0 && typeof maxOrderRows[0].order === 'number'
        ? (maxOrderRows[0].order as number) + 1
        : 1;

    const ins = await sb.from('template_folders').insert([
      {
        user_id: userId,
        system: false,
        name: valid,
        order: nextOrder,
      },
    ]);

    await logUserAction({
      userId,
      action: 'templates:create_folder',
      metadata: { name: valid, order: nextOrder },
    });

    setIsLoading(false);
    if (ins.error) {
      setError(ins.error.message);
      throw ins.error;
    }
  };

  const renameTemplateFolder = async (userId: string, oldName: string, nextName: string) => {
    setIsLoading(true);
    setError(null);

    if (isSystemFolder(oldName)) {
      setIsLoading(false);
      throw new Error('Cannot rename a system folder.');
    }

    const ownQ = await sb
      .from('template_folders')
      .select('name')
      .eq('user_id', userId)
      .eq('system', false);

    if (ownQ.error) {
      setIsLoading(false);
      setError(ownQ.error.message);
      throw ownQ.error;
    }

    const existing = ((ownQ.data ?? []) as TFolderRow[]).map((r) => r.name);
    const valid = validateFolderName(
      nextName,
      existing.filter((n) => n !== oldName)
    );

    const upd = await sb
      .from('template_folders')
      .update({ name: valid })
      .eq('user_id', userId)
      .eq('system', false)
      .eq('name', oldName);

    if (upd.error) {
      setIsLoading(false);
      setError(upd.error.message);
      throw upd.error;
    }

    const move = await sb
      .from('template_items')
      .update({ folder: valid })
      .eq('user_id', userId)
      .eq('folder', oldName);

    await logUserAction({
      userId,
      action: 'templates:rename_folder',
      metadata: { from: oldName, to: valid },
    });

    setIsLoading(false);
    if (move.error) {
      setError(move.error.message);
      throw move.error;
    }
  };

  const deleteTemplateFolder = async (userId: string, name: string) => {
    setIsLoading(true);
    setError(null);

    if (isSystemFolder(name)) {
      setIsLoading(false);
      throw new Error('Cannot delete reserved folder.');
    }

    const chk = await sb
      .from('template_items')
      .select('id')
      .eq('user_id', userId)
      .eq('folder', name)
      .limit(1);

    if (chk.error) {
      setIsLoading(false);
      setError(chk.error.message);
      throw chk.error;
    }
    if ((chk.data ?? []).length > 0) {
      setIsLoading(false);
      throw new Error('Block is not empty.');
    }

    const del = await sb
      .from('template_folders')
      .delete()
      .eq('user_id', userId)
      .eq('system', false)
      .eq('name', name);

    await logUserAction({
      userId,
      action: 'templates:delete_folder',
      metadata: { name },
    });

    setIsLoading(false);
    if (del.error) {
      setError(del.error.message);
      throw del.error;
    }
  };

  /** Переупорядочить только пользовательские папки. */
  const reorderTemplateFolders = async (userId: string, orderedCustom: string[]) => {
    setIsLoading(true);
    setError(null);

    if (orderedCustom.length > MAX_CUSTOM_FOLDERS) {
      setIsLoading(false);
      throw new Error(`Limit reached (${MAX_CUSTOM_FOLDERS}).`);
    }

    for (let i = 0; i < orderedCustom.length; i++) {
      const name = orderedCustom[i];
      const upd = await sb
        .from('template_folders')
        .update({ order: i + 1 })
        .eq('user_id', userId)
        .eq('system', false)
        .eq('name', name);
      if (upd.error) {
        setIsLoading(false);
        setError(upd.error.message);
        throw upd.error;
      }
    }

    await logUserAction({
      userId,
      action: 'templates:reorder_folders',
      metadata: { count: orderedCustom.length },
    });

    setIsLoading(false);
  };

  /* Items CRUD */

  const createTemplate = async (input: TemplateInput) => {
    setIsLoading(true);
    setError(null);

    const title = (input.title || '').trim();
    if (!title) {
      setIsLoading(false);
      throw new Error('Template title cannot be empty.');
    }
    if (title.length > TEMPLATE_TITLE_LIMIT) {
      setIsLoading(false);
      throw new Error(`Template title is too long (>${TEMPLATE_TITLE_LIMIT}).`);
    }

    const payload = {
      user_id: input.user_id,
      system: false,
      title,
      content: input.content ?? '',
      folder: null, // по ТЗ новые – вне папки
    };

    const ins = await sb.from('template_items').insert([payload]);

    await logUserAction({
      userId: input.user_id,
      action: 'templates:create',
      metadata: { title: payload.title },
    });

    setIsLoading(false);
    if (ins.error) {
      setError(ins.error.message);
      throw ins.error;
    }
  };

  const updateTemplate = async (
    id: string,
    userId: string,
    patch: Partial<Pick<TemplateInput, 'title' | 'content'>>
  ) => {
    setIsLoading(true);
    setError(null);

    if (patch.title) {
      const t = patch.title.trim();
      if (!t) {
        setIsLoading(false);
        throw new Error('Template title cannot be empty.');
      }
      if (t.length > TEMPLATE_TITLE_LIMIT) {
        setIsLoading(false);
        throw new Error(`Template title is too long (>${TEMPLATE_TITLE_LIMIT}).`);
      }
    }

    const upd = await sb
      .from('template_items')
      .update(patch)
      .eq('id', id)
      .eq('user_id', userId)
      .eq('system', false);

    await logUserAction({
      userId,
      action: 'templates:update',
      metadata: { id, fields: Object.keys(patch) },
    });

    setIsLoading(false);
    if (upd.error) {
      setError(upd.error.message);
      throw upd.error;
    }
  };

  const deleteTemplate = async (id: string, userId: string) => {
    setIsLoading(true);
    setError(null);

    const del = await sb
      .from('template_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .eq('system', false);

    await logUserAction({
      userId,
      action: 'templates:delete',
      metadata: { id },
    });

    setIsLoading(false);
    if (del.error) {
      setError(del.error.message);
      throw del.error;
    }
  };

  const moveTemplateToFolder = async (id: string, userId: string, targetFolder: string | null) => {
    setIsLoading(true);
    setError(null);

    if (isSystemFolder(targetFolder)) {
      setIsLoading(false);
      throw new Error("You can't move items into system folders.");
    }

    const upd = await sb
      .from('template_items')
      .update({ folder: targetFolder })
      .eq('id', id)
      .eq('user_id', userId)
      .eq('system', false);

    await logUserAction({
      userId,
      action: 'templates:move',
      metadata: { id, to: targetFolder ?? null },
    });

    setIsLoading(false);
    if (upd.error) {
      setError(upd.error.message);
      throw upd.error;
    }
  };

  /** Дублировать системный темплейт в «вне папки» пользователя. */
  const duplicateTemplateFromSystem = async (templateId: string, userId: string) => {
    setIsLoading(true);
    setError(null);

    const get = await sb
      .from('template_items')
      .select('id, system, title, content')
      .eq('id', templateId)
      .single();

    if (get.error) {
      setIsLoading(false);
      setError(get.error.message);
      throw get.error;
    }
    const tpl = get.data as { id: string; system: boolean; title: string; content: string };
    if (!tpl?.system) {
      setIsLoading(false);
      throw new Error('Only system templates can be duplicated here.');
    }

    const newTitle = await buildDuplicateTitle(userId, tpl.title);

    const ins = await sb.from('template_items').insert([
      {
        user_id: userId,
        system: false,
        title: newTitle,
        content: tpl.content,
        folder: null, // по ТЗ: вне папки
      },
    ]);

    await logUserAction({
      userId,
      action: 'templates:duplicate_from_system',
      metadata: { fromId: templateId, newTitle },
    });

    setIsLoading(false);
    if (ins.error) {
      setError(ins.error.message);
      throw ins.error;
    }
  };

  /** Лог: пользователь вставил темплейт в инпут (для аналитики). */
  const logInsertIntoInput = async (userId: string, templateId: string, isSystem: boolean) => {
    await logUserAction({
      userId,
      action: 'templates:insert_into_input',
      metadata: { templateId, isSystem },
    });
  };

  return {
    isLoading,
    error,
    // read
    getTemplateFolders,
    getTemplates,
    // folders
    createTemplateFolder,
    renameTemplateFolder,
    deleteTemplateFolder,
    reorderTemplateFolders,
    // items
    createTemplate,
    updateTemplate,
    deleteTemplate,
    moveTemplateToFolder,
    duplicateTemplateFromSystem,
    // analytics
    logInsertIntoInput,
    // constants
    SYS_FOLDERS,
    MAX_CUSTOM_FOLDERS,
    FOLDER_NAME_LIMIT,
    TEMPLATE_TITLE_LIMIT,
  };
}
