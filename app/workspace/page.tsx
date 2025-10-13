'use client';

import { useEffect, useLayoutEffect, useRef, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthProvider';
import dynamic from 'next/dynamic';
import HeaderBar from '@/app/components/HeaderBar';
import ChatBubble from '@/app/components/ChatBubble';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import { useUserPlan } from '@/app/hooks/useUserPlan';
import {
  Plus,
  SendHorizonal,
  X,
  Loader,
  ChevronDown,
  Image as ImageIcon,
  Layers,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useChatLogic } from '@/app/hooks/useChatLogic';
import React from 'react';
import { useChatInputState } from '@/app/hooks/useChatInputState';
import { useDragOverlay } from '@/app/hooks/useDragOverlay';
import { useScrollObserver } from '@/app/hooks/useScrollObserver';
import SaveProfileModal from '@/app/components/SaveProfileModal';
import { useSavedProfiles } from '@/app/hooks/useSavedProfiles';
import { FaLinkedin } from 'react-icons/fa';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import SessionBridge from '@/app/components/SessionBridge';
import GlobalLoading from '@/app/loading';
import { useSidebar } from '@/app/context/SidebarContext';
import { useOnboardingWorkspace } from '@/app/hooks/useOnboardingWorkspace';

type Attachment = { name: string; base64: string };

function AmbientBackdrop({ src }: { src: string }) {
  return (
    <div
      aria-hidden
      className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={src}
          alt=""
          className="w-[88vmin] max-w-[min(88vmin,1600px)] h-auto object-contain opacity-[0.005]"
          style={{
            filter: 'contrast(1.05)',
            maskImage: 'radial-gradient(60% 60% at 50% 45%, #000 60%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(60% 60% at 50% 45%, #000 60%, transparent 100%)',
          }}
        />
      </div>
    </div>
  );
}

const LimitModal = dynamic(() => import('@/app/components/LimitModal'), { ssr: false });
const DayLimitModal = dynamic(() => import('@/app/components/DayLimitModal'), { ssr: false });

const Sidebar = dynamic(() => import('./Sidebar'), {
  loading: () => <div className="p-8 text-[var(--text-secondary)]">Loading Sidebar...</div>,
  ssr: false,
});

const SidebarHelper = dynamic(() => import('./SidebarHelper'), {
  loading: () => <div className="p-8 text-[var(--text-secondary)]">Loading Helper...</div>,
  ssr: false,
});

const OnboardingSpotlight = dynamic(
  () => import('@/app/components/onboarding/OnboardingSpotlight'),
  { ssr: false }
);

export default function WorkspacePage() {
  const { session, user, isLoading } = useAuth();
  const [refreshToken, setRefreshToken] = useState(0);
  const router = useRouter();

  const userName = user?.user_metadata?.full_name || user?.email || 'User';

  const {
    messages,
    isGenerating,
    errorMessage,
    handleGenerate,
    handleRate,
    generationError,
    retryGeneration,
    clearMessages,
    messageStatuses,
    messageRatings,
    historyLoaded,
    profilingMode,
    setProfilingMode,
    bypassHistoryCheckOnce,
  } = useChatLogic();

  const {
    plan: packageType,
    used: usedDaily, // ⬅️ дневное использование
    limits, // ⬅️ { dailyGenerations, monthlyGenerations }
    hasReachedLimit: limitReached, // (осталось)
    hasReachedDailyLimit, // ⬅️ дневной лимит достигнут?
    hasReachedMonthlyLimit, // (было)
    limitResetAt, // ⬅️ время последнего ресета (из БД)
    refetch,
  } = useUserPlan(refreshToken);

  const shownMonthlyOnceRef = useRef(false);

  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const shownDailyOnceRef = useRef(false);

  const dailyResetLabel = React.useMemo(() => {
    const now = new Date();
    const next = new Date(now);
    next.setHours(24, 0, 0, 0);
    try {
      return next.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '00:00';
    }
  }, [limitResetAt, hasReachedDailyLimit]);

  useEffect(() => {
    if (hasReachedMonthlyLimit && !shownMonthlyOnceRef.current) {
      setShowLimitModal(true);
      shownMonthlyOnceRef.current = true;
    }
    if (!hasReachedMonthlyLimit) {
      shownMonthlyOnceRef.current = false;
    }
  }, [hasReachedMonthlyLimit]);

  useEffect(() => {
    if (
      hasReachedDailyLimit &&
      !hasReachedMonthlyLimit && // ⬅️ добавили проверку
      !shownDailyOnceRef.current
    ) {
      setShowDailyModal(true);
      shownDailyOnceRef.current = true;
    }
    if (!hasReachedDailyLimit) {
      shownDailyOnceRef.current = false;
    }
  }, [hasReachedDailyLimit, hasReachedMonthlyLimit]);

  useEffect(() => {
    if (showDailyModal && !hasReachedDailyLimit) {
      setShowDailyModal(false);
    }
  }, [showDailyModal, hasReachedDailyLimit]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHelperOpen, setIsHelperOpen] = useState(false);
  const { openSidebar, toggleSidebar, closeAllSidebars } = useSidebar();

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)'); // md-брейкпоинт
    const apply = (isDesktop: boolean) => {
      setIsHelperOpen(isDesktop);
      setIsSidebarOpen(isDesktop);

      if (isDesktop) {
        if (!openSidebar?.left) toggleSidebar('left');
        if (!openSidebar?.right) toggleSidebar('right');
      } else {
        closeAllSidebars();
      }
    };

    apply(mq.matches);

    const onChange = (e: MediaQueryListEvent) => apply(e.matches);
    mq.addEventListener?.('change', onChange);
    // @ts-ignore (Safari fallback)
    mq.addListener?.(onChange);

    return () => {
      mq.removeEventListener?.('change', onChange);
      // @ts-ignore
      mq.removeListener?.(onChange);
      closeAllSidebars();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('theme')) {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    const sessionId = url.searchParams.get('session_id');
    const checkoutSuccess = url.searchParams.get('checkout') === 'success';

    if (sessionId || checkoutSuccess) {
      fetch('/api/internal/sync-subscriptions').finally(() => {
        refetch()?.catch(console.error);
        setRefreshToken((t) => t + 1);
      });
    }
  }, []);

  const {
    inputValue,
    setInputValue,
    attachedFiles,
    handleFileChange,
    handleFileRemove,
    hasErrors,
    error,
    resetInput,
    fileStatus,
  } = useChatInputState();

  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    // safe previews without memory leaks
    const urls = attachedFiles.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [attachedFiles]);

  const [attachmentError, setAttachmentError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMode, setConfirmMode] = useState<'manual' | 'pregenerate'>('manual');
  const pendingInputRef = useRef<string>('');
  const pendingFilesRef = useRef<File[]>([]);
  const confirmRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { isDragging, overlay, setIsDragging } = useDragOverlay();

  const { isAtBottom } = useScrollObserver(bottomRef, scrollRef, historyLoaded);

  const { saveProfile, getFolders } = useSavedProfiles();

  const {
    ready,
    showStep1,
    showStep2,
    showStep3,
    showStep4,
    showFirstImageDrag,
    showStep6,
    acceptStep1,
    dismissStep1,
    acceptStep2,
    dismissStep2,
    acceptStep3,
    dismissStep3,
    acceptStep4,
    dismissStep4,
    acceptFirstImageDrag,
    laterFirstImageDrag,
    acceptStep6,
    triggerFirstAssistantReply,
    triggerSaveModalOpened,
    triggerFirstImage,
    triggerCdrsEnabled,
  } = useOnboardingWorkspace();

  const proceedStep1 = acceptStep1;
  const proceedStep2 = acceptStep2;

  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    if (showSaveModal) {
      requestAnimationFrame(() => {
        triggerSaveModalOpened();
      });
    }
  }, [showSaveModal]);

  const [aiResponseToSave, setAiResponseToSave] = useState<string>('');
  const [isNewProfile, setIsNewProfile] = useState(true);

  const [isImageActive, setIsImageActive] = useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const [isChatActive, setIsChatActive] = useState(false);
  const [chatMode, setChatMode] = useState<'none' | 'image' | 'chat'>('none');

  const [isCdrMode, setIsCdrMode] = useState(false);
  const [folders, setFolders] = useState<string[]>([]);

  type CdrItem = { id: string; profile_name: string };
  const [cdrSelected, setCdrSelected] = useState<CdrItem[]>([]);

  const handleSelectForCdr = (profile: { id: string; profile_name: string }) => {
    setCdrSelected((prev) => {
      const exists = prev.some((x) => x.id === profile.id);
      if (exists) {
        return prev.filter((x) => x.id !== profile.id);
      }
      if (prev.length >= 5) {
        alert('You can attach up to 5 saved reports.');
        return prev;
      }
      return [...prev, { id: profile.id, profile_name: profile.profile_name }];
    });
  };

  const imageBlockedByCdrs = cdrSelected.length > 0;

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    if (!isLoading && !session) router.push('/');
  }, [session, isLoading, router]);

  useEffect(() => {
    (async () => {
      const uid = session?.user?.id;
      if (!uid) return;
      const list = await getFolders(uid);
      setFolders(list.filter((f) => f !== 'CDRs'));
    })();
  }, [session?.user?.id, getFolders]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const lineHeight = 24;
      const maxHeight = lineHeight * 8;
      textareaRef.current.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [inputValue]);

  useEffect(() => {
    if (historyLoaded && messages.length > 0) {
      scrollToBottom();
    }
  }, [historyLoaded, messages]);

  // === ONBOARDING: Step 3 trigger — first assistant reply (после готовности) ===
  useEffect(() => {
    if (!historyLoaded || !ready) return;
    const hasAssistant = messages.some((m) => m.role === 'assistant');
    if (hasAssistant) {
      requestAnimationFrame(() => {
        triggerFirstAssistantReply();
      });
    }
  }, [historyLoaded, ready, messages]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showConfirm && confirmRef.current && !confirmRef.current.contains(e.target as Node)) {
        setShowConfirm(false);
      }
      const dropdown = document.querySelector('[aria-label="More Button"]')?.parentElement;
      if (showMoreDropdown && dropdown && !dropdown.contains(e.target as Node)) {
        setShowMoreDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showConfirm, showMoreDropdown]);

  const handleLogoutConfirm = () => {
    if (window.confirm('Are you sure you want to return to the home page?')) router.push('/');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleSaveClick = () => {
    const lastAiMsg = [...messages].reverse().find((msg) => msg.role === 'assistant');
    if (lastAiMsg) {
      setAiResponseToSave(lastAiMsg.content);
      setIsNewProfile(true);
      setShowSaveModal(true);
    } else {
      alert('No AI response found to save.');
    }
  };

  const submit = async () => {
    const hasInput = inputValue.trim() !== '';
    const hasFiles = attachedFiles.length > 0;
    if (!isCdrMode && chatMode === 'none') {
      alert('Please select how you want to interact: Chat or AI Discernment.');
      return;
    }

    if (hasReachedMonthlyLimit) {
      setShowLimitModal(true);
      return;
    }
    if (hasReachedDailyLimit) {
      setShowDailyModal(true);
      return;
    }

    // Предварительное подтверждение очистки только для режима Image
    if (chatMode === 'image' && attachedFiles.length > 0 && messages.length > 0) {
      pendingInputRef.current = inputValue;
      pendingFilesRef.current = attachedFiles;
      setConfirmMode('pregenerate');
      setShowConfirm(true);
      return;
    }

    if (isCdrMode) {
      if (cdrSelected.length < 2) {
        alert('Select at least 2 saved reports for CDRs.');
        return;
      }
      if (attachedFiles.length > 1) {
        alert('Only 1 photo is allowed in CDRs mode.');
        return;
      }
    }

    try {
      const attachments: Attachment[] = await Promise.all(
        attachedFiles.map(
          (file) =>
            new Promise<Attachment>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve({ name: file.name, base64: reader.result as string });
              reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
              reader.readAsDataURL(file);
            })
        )
      );

      // CDRs: зафиксировать выбор и очистить чипы ДО запроса
      const selectedIds = cdrSelected.map((x) => x.id);
      const selectedDisplay = cdrSelected.map(({ id, profile_name }) => ({ id, profile_name }));
      if (isCdrMode) setCdrSelected([]);

      resetInput();

      await handleGenerate(
        inputValue.trim(),
        attachments,
        isCdrMode
          ? {
              mode: 'cdrs',
              savedMessageIds: selectedIds,
              cdrDisplay: selectedDisplay,
            }
          : chatMode === 'image'
            ? { mode: 'image' }
            : { mode: 'chat' }
      );

      // сообщаем левому сайдбару перезагрузить Saved messages
      if (isCdrMode) {
        window.dispatchEvent(new Event('savedMessages:refresh'));
      }

      refetch().catch(console.error);
      setAttachmentError('');
    } catch (err: any) {
      console.error(err);
      setAttachmentError(err.message || 'Failed to process file.');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCdrMode) {
      if (attachedFiles.length >= 1 || e.dataTransfer.files.length > 1) {
        alert('Only 1 photo is allowed in CDRs mode.');
        setIsDragging(false);
        queueMicrotask(() => setIsDragging(false));
        return;
      }
    }

    if (e.dataTransfer.files.length) {
      const event = {
        target: { files: e.dataTransfer.files },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      handleFileChange(event);
      triggerFirstImage();
      setIsDragging(false);
      queueMicrotask(() => setIsDragging(false));

      // Автоматическая активация режима Image
      setIsImageActive(true);
      setIsChatActive(false);
      setChatMode('image');
      setProfilingMode(true);
    }
  };

  if (isLoading) return <GlobalLoading />;
  if (!session) return <div className="p-8 text-[var(--text-secondary)]">❌ No access</div>;

  return (
    <>
      <SessionBridge />

      <div
        className="flex h-[100dvh] bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 relative overflow-hidden"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {/* фон под всем */}
        <AmbientBackdrop src="/images/ambient.png" />
        {/* весь контент поверх */}
        <div className="relative z-10 flex w-full">
          {isHelperOpen && (
            <ErrorBoundary>
              <SidebarHelper
                key={isCdrMode ? 'cdr' : 'normal'}
                isCdrMode={isCdrMode}
                onSelectForCdr={handleSelectForCdr}
                preselectedIds={cdrSelected.map((x) => x.id)}
              />
            </ErrorBoundary>
          )}
          {isSidebarOpen && (
            <ErrorBoundary>
              <Sidebar packageType={packageType} refreshToken={refreshToken} />
            </ErrorBoundary>
          )}

          <HeaderBar
            onLogout={handleLogoutConfirm}
            onSaveProfiling={handleSaveClick}
            disableSaveProfiling={isGenerating || messages.length === 0}
          />

          <div
            id="ws-onb-anchor"
            className="pointer-events-none absolute top-[60px] left-1/2 -translate-x-1/2 h-1 w-1 z-[31]"
          />

          <div
            className={`flex-1 flex flex-col justify-center items-center ${messages.length === 0 ? 'pb-0' : 'pb-[135px]'}`}
          >
            <div
              className={`w-full max-w-3xl flex-1 pt-[72px] px-4 sm:px-6 md:px-8 no-scrollbar ${messages.length === 0 ? 'overflow-hidden' : 'overflow-y-auto'}`}
              ref={scrollRef}
            >
              <div className="flex flex-col items-start justify-start py-4">
                {errorMessage && !generationError && (
                  <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-lg text-sm flex justify-between w-full">
                    <span>{errorMessage}</span>
                    <button
                      onClick={() => {
                        setAttachmentError('');
                        setInputValue('');
                      }}
                      className="text-red-700 hover:underline text-xs"
                    >
                      Close
                    </button>
                  </div>
                )}

                {messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center justify-center text-center w-full py-12 px-4 mt-28"
                  >
                    {/* Лого */}
                    <img
                      src="/images/logo.png"
                      alt="Logo"
                      className="w-10 h-10 mb-1 drop-shadow-md"
                    />

                    {/* Основной текст */}
                    <p
                      className="text-[20px] font-semibold text-center text-gray-700 dark:text-[var(--text-primary)]
                      drop-shadow-[0_2px_4px_rgba(0,0,0,0.20)] dark:drop-shadow-none"
                    >
                      Advanced AI Discernment
                    </p>

                    {/* Подпись */}
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">By {userName}</p>
                  </motion.div>
                )}

                {messages.map((msg, i) => (
                  <React.Fragment key={`${msg.id}-${msg.timestamp}`}>
                    <Suspense
                      fallback={
                        <div className="text-[var(--text-secondary)] text-xs">
                          Loading message...
                        </div>
                      }
                    >
                      <ChatBubble
                        index={i}
                        role={msg.role}
                        content={msg.content}
                        messageId={msg.id}
                        status={messageStatuses[msg.id]}
                        rating={messageRatings[msg.id]}
                        onRate={handleRate}
                      />
                    </Suspense>
                    {generationError && generationError.index === i && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm my-2">
                        An error occurred while generating the response.
                        <button
                          onClick={() => retryGeneration()}
                          className="underline ml-2 text-red-600 hover:text-red-800"
                        >
                          Try again
                        </button>
                      </div>
                    )}
                  </React.Fragment>
                ))}

                <div ref={bottomRef} />

                {messages.length > 0 && (
                  <div className="w-full text-center my-4">
                    <button
                      onClick={() => {
                        setConfirmMode('manual');
                        setShowConfirm(true);
                      }}
                      className="text-xs text-[var(--text-secondary)] opacity-60 hover:opacity-100 transition"
                    >
                      Clear history
                    </button>
                  </div>
                )}

                {isGenerating &&
                  messages.length > 0 &&
                  messages[messages.length - 1]?.role === 'user' && (
                    <div className="w-full text-left py-1 text-sm text-[var(--text-secondary)] animate-pulse">
                      Analysing...
                    </div>
                  )}

                {fileStatus && (
                  <div className="w-full text-left py-1 text-sm text-[var(--text-secondary)] animate-pulse">
                    {fileStatus}
                  </div>
                )}
              </div>
            </div>

            <div
              id="ws-input-panel"
              className="fixed inset-x-0 bottom-0 w-full px-3 sm:px-4 md:px-6 pb-safe keyboard-safe"
            >
              <div className="relative max-w-3xl mx-auto bg-[var(--card-bg)] rounded-3xl p-3 shadow-2xl overflow-visible">
                <div
                  id="onb-ws-step2-anchor"
                  className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 h-1 w-1 z-[31]"
                />
                {attachedFiles.length > 0 && (
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {attachedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="relative w-20 h-20 rounded-xl overflow-hidden max-w-full sm:max-w-[80px]"
                      >
                        <img
                          src={previewUrls[idx]}
                          alt={`attachment ${idx}`}
                          className="object-cover w-full h-full rounded-xl"
                        />
                        <button
                          onClick={() => handleFileRemove(file)}
                          className="absolute top-0 right-0 bg-black bg-opacity-60 rounded-full p-1 text-white hover:bg-opacity-80"
                          aria-label="Remove attached file"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {isCdrMode && cdrSelected.length > 0 && (
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {cdrSelected.map((it) => (
                      <span
                        key={it.id}
                        className="inline-flex items-center gap-2 px-2 py-1 text-xs rounded-full
                                   bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--card-border)]"
                        title={it.profile_name}
                      >
                        <span className="max-w-[220px] truncate">{it.profile_name}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setCdrSelected((prev) => prev.filter((x) => x.id !== it.id))
                          }
                          className="opacity-70 hover:opacity-100"
                          aria-label="Remove"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-col gap-0.5 overflow-visible">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything"
                    disabled={isDragging}
                    className="w-full px-4 py-2 text-sm placeholder:text-sm ios-no-zoom leading-5 min-h-[36px] placeholder-[var(--text-secondary)] rounded-xl focus:outline-none focus:ring-0 bg-[var(--card-bg)] text-[var(--text-primary)] resize-none overflow-y-auto max_h-[120px]"
                  />

                  <div className="flex flex-wrap justify-between items-center w-full px-1 gap-2 mt-0.5">
                    <div className="flex flex-wrap gap-2 items-center">
                      <label
                        className={`cursor-pointer w-9 h-9 flex items-center justify-center rounded-full shadow-sm transition
                                  bg-[var(--button-bg)] dark:bg-[var(--card-bg)] hover:bg-[var(--button-hover-bg)]`}
                        title={
                          isCdrMode
                            ? attachedFiles.length >= 1
                              ? 'Only 1 photo allowed in CDRs'
                              : 'Attach up to 1 photo in CDRs'
                            : undefined
                        }
                      >
                        <Plus size={16} className="text-[var(--text-primary)]" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          multiple={!isCdrMode}
                          disabled={isCdrMode && attachedFiles.length >= 1}
                          title={
                            isCdrMode && attachedFiles.length >= 1
                              ? 'Only 1 photo allowed in CDRs'
                              : undefined
                          }
                          onChange={(e) => {
                            handleFileChange(e);
                            triggerFirstImage();
                            if (e.target.files && e.target.files.length > 0) {
                              setIsImageActive(true);
                              setIsChatActive(false);
                              setChatMode('image');
                              setProfilingMode(true);
                            }
                          }}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          if (isCdrMode && cdrSelected.length === 0) {
                            setIsCdrMode(false);
                          }
                          if (imageBlockedByCdrs) {
                            alert('Disable CDRs attachments to use Image mode.');
                            return;
                          }
                          if (!isImageActive) {
                            setIsImageActive(true);
                            setChatMode('image');
                            setIsChatActive(false);
                            setProfilingMode(true);
                            return;
                          }
                          if (attachedFiles.length > 0) {
                            return;
                          }
                          setIsImageActive(false);
                          setChatMode('none');
                          setIsChatActive(false);
                          setProfilingMode(false);
                        }}
                        disabled={imageBlockedByCdrs}
                        title={
                          imageBlockedByCdrs
                            ? 'Unavailable while CDRs attachments are selected'
                            : 'Toggle Image Mode'
                        }
                        className={`
                        flex items-center gap-1 h-8 px-3
                        rounded-full shadow-sm transition text-xs font-medium
                        ${
                          isImageActive
                            ? 'bg-[#C084FC] text-white hover:bg-[#a05adb] dark:bg-[var(--button-hover-bg)] dark:text-[var(--text-primary)] dark:hover:bg-[var(--button-hover-bg)] dark:ring-1 dark:ring-[var(--card-border)]'
                            : 'bg-[var(--button-bg)] text-[var(--text-primary)] hover:bg-[var(--button-hover-bg)] dark:bg-[var(--card-bg)]'
                        }
                          ${imageBlockedByCdrs ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                        aria-label="Toggle Image Mode"
                      >
                        <ImageIcon size={14} />
                        Image
                      </button>

                      <button
                        id="ws-cdrs-btn"
                        type="button"
                        data-ignore-sidebar-close="true"
                        onClick={() => {
                          if (isCdrMode && cdrSelected.length > 0) {
                            alert('Remove all CDR attachments to turn CDRs off.');
                            return;
                          }

                          const next = !isCdrMode;
                          if (next && (attachedFiles.length > 0 || isImageActive))
                            setIsImageActive(false);
                          setIsCdrMode(next);
                          if (next) triggerCdrsEnabled();

                          if (next) {
                            setIsHelperOpen(true);
                            if (!openSidebar?.left) toggleSidebar('left');
                            window.dispatchEvent(new Event('sidebarHelper:openSaved'));
                          }
                        }}
                        aria-pressed={isCdrMode}
                        className={`
                          flex items-center gap-1 h-8 px-3 rounded-full shadow-sm transition text-xs font-medium
                          ${
                            isCdrMode
                              ? 'bg-[#C084FC] text-white hover:bg-[#a05adb] dark:bg-[var(--button-hover-bg)] dark:text-[var(--text-primary)] dark:hover:bg-[var(--button-hover-bg)] dark:ring-1 dark:ring-[var(--card-border)]'
                              : 'bg-[var(--button-bg)] text-[var(--text-primary)] hover:bg-[var(--button-hover-bg)] dark:bg-[var(--card-bg)]'
                          }
                          `}
                        title={
                          isCdrMode && cdrSelected.length > 0
                            ? 'Remove all attachments to turn CDRs off'
                            : 'CDRs mode'
                        }
                        aria-label="CDRs Button"
                      >
                        <Layers className="w-4 h-4" />
                        CDRs
                      </button>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowMoreDropdown(!showMoreDropdown)}
                          aria-label="More Button"
                          className="
                        flex items-center gap-1 h-8 px-3
                       rounded-full shadow-sm transition
                       bg-[var(--button-bg)] text-[var(--text-primary)]
                       hover:bg-[var(--button-hover-bg)] dark:bg-[var(--card-bg)]
                       text-xs font-medium
                      "
                        >
                          More
                          <ChevronDown
                            size={14}
                            className={`transition-transform duration-200 ${showMoreDropdown ? 'rotate-180' : ''}`}
                          />
                        </button>

                        {showMoreDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.2 }}
                            className="
                              absolute bottom-full mb-2 left-0 z-50
                              w-48 max-w-[calc(100vw-2rem)] rounded-xl shadow-xl
                              bg-[var(--card-bg)] text-[var(--text-primary)]
                              border border-[var(--card-border)]
                              overflow-auto max-h-[50vh] text-sm
                            "
                          >
                            <button
                              className={`w-full text-left px-4 py-2 text-xs hover:bg-[var(--surface-secondary)] transition ${isChatActive ? 'text-[#C084FC]' : ''}`}
                              onClick={() => {
                                if (isCdrMode && cdrSelected.length > 0) {
                                  alert('Remove all CDR attachments to switch modes.');
                                  return;
                                }
                                if (isCdrMode && cdrSelected.length === 0) {
                                  setIsCdrMode(false);
                                }

                                const next = !isChatActive;
                                setIsChatActive(next);
                                setChatMode(next ? 'chat' : 'none');
                                setIsImageActive(false);
                                setShowMoreDropdown(false);
                              }}
                            >
                              💬 Grok 4
                            </button>
                            <button
                              className="w-full text-left px-4 py-2 text-xs hover:bg-[var(--surface-secondary)] transition"
                              onClick={() => alert('Currently not available.')}
                            >
                              <span className="inline-flex items-center gap-2">
                                <FaLinkedin className="w-3.5 h-3.5" />
                                LinkedIn
                              </span>
                            </button>
                            <button
                              className="w-full text-left px-4 py-2 text-xs hover:bg-[var(--surface-secondary)] transition"
                              onClick={() => alert('Currently not available.')}
                            >
                              DISC/BIG 5
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={submit}
                      disabled={
                        limitReached ||
                        isGenerating ||
                        (isCdrMode
                          ? cdrSelected.length < 2 || attachedFiles.length > 1 // в CDRs достаточно >=2 выбранных, текст не обязателен
                          : !inputValue.trim() && attachedFiles.length === 0) // в обычных режимах как было
                      }
                      title={
                        isCdrMode
                          ? cdrSelected.length < 2
                            ? 'Select at least 2 saved reports'
                            : attachedFiles.length > 1
                              ? 'Only 1 photo allowed in CDRs'
                              : undefined
                          : undefined
                      }
                      className={`
                    w-9 h-9 flex items-center justify-center
                    rounded-full
                     bg-[var(--button-bg)] dark:bg-[var(--card-bg)]
                    shadow-md
                    text-[var(--text-primary)]
                    hover:bg-[var(--button-hover-bg)]
                    transition
                    ${
                      limitReached ||
                      isGenerating ||
                      (isCdrMode
                        ? cdrSelected.length < 2 || attachedFiles.length > 1
                        : !inputValue.trim() && attachedFiles.length === 0)
                        ? 'cursor-not-allowed opacity-50'
                        : ''
                    }
                  `}
                      aria-label="Start Generation"
                    >
                      {isGenerating ? (
                        <Loader size={20} className="animate-spin" />
                      ) : (
                        <SendHorizonal size={20} />
                      )}
                    </button>
                  </div>

                  {hasErrors && <p className="text-xs text-[var(--danger)] px-2 pt-1">{error}</p>}
                  {attachmentError && (
                    <p className="text-xs text-[var(--danger)] px-2 pt-1">{attachmentError}</p>
                  )}
                </div>
              </div>

              <div className="mt-2 text-center text-xs text-[var(--text-secondary)]">
                H1NTED can make mistakes. See{' '}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[var(--text-primary)]"
                >
                  Terms of Use
                </a>{' '}
                and{' '}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[var(--text-primary)]"
                >
                  Privacy Policy
                </a>
                .
              </div>
            </div>
          </div>

          {!isAtBottom && (
            <button
              onClick={scrollToBottom}
              className="
              absolute
              right-3 md:right-4
              bottom-24 sm:bottom-28
              w-9 h-9
              flex items-center justify-center
              rounded-full
              bg-[var(--card-bg)]
              text-[var(--text-primary)]
              ring-1 ring-[var(--card-border)]
              shadow-md
              hover:bg-[var(--button-hover-bg)]
              transition
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]
             "
              aria-label="Scroll to latest message"
            >
              <ChevronDown className="w-4 h-4 translate-y-[0.5px]" />
            </button>
          )}

          {showConfirm && (
            <div className="absolute inset-0 flex items-center justify-center z-50">
              <div
                ref={confirmRef}
                className="bg-[var(--card-bg)] text-[var(--text-primary)] rounded-xl px-5 py-3 shadow-md border border-[var(--card-border)] max-w-[350px] w-full text-sm"
              >
                <p className="text-left mb-3">
                  {confirmMode === 'manual'
                    ? 'Clear history? Save it first if needed.'
                    : 'The previous message will be deleted. Save it first if needed. Ready to proceed?'}
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    No
                  </button>
                  <button
                    onClick={async () => {
                      if (confirmMode === 'manual') {
                        setShowConfirm(false); // закрываем окно сразу
                        try {
                          await clearMessages();
                        } catch (e) {
                          console.error(e);
                        } finally {
                          setShowConfirm(false);
                        }
                        return;
                      }
                      // pregenerate: очистить историю и запустить генерацию с буферами
                      await clearMessages();
                      resetInput();
                      setProfilingMode(false);
                      setShowConfirm(false);
                      await new Promise((r) => requestAnimationFrame(() => r(null)));
                      await new Promise((r) => setTimeout(r, 16));
                      try {
                        const files = pendingFilesRef.current;
                        const attachments: Attachment[] = await Promise.all(
                          files.map(
                            (file) =>
                              new Promise<Attachment>((resolve, reject) => {
                                const reader = new FileReader();
                                reader.onload = () =>
                                  resolve({ name: file.name, base64: reader.result as string });
                                reader.onerror = () =>
                                  reject(new Error(`Failed to read file: ${file.name}`));
                                reader.readAsDataURL(file);
                              })
                          )
                        );

                        // CDRs: зафиксировать выбор и очистить чипы ДО запроса
                        const selectedIds = cdrSelected.map((x) => x.id);
                        const selectedDisplay = cdrSelected.map(({ id, profile_name }) => ({
                          id,
                          profile_name,
                        }));
                        if (isCdrMode) setCdrSelected([]);

                        bypassHistoryCheckOnce();
                        await handleGenerate(
                          (pendingInputRef.current || '').trim(),
                          attachments,
                          isCdrMode
                            ? {
                                mode: 'cdrs',
                                savedMessageIds: selectedIds,
                                cdrDisplay: selectedDisplay,
                              }
                            : chatMode === 'image'
                              ? { mode: 'image' }
                              : { mode: 'chat' }
                        );
                        // после успешной генерации CDR уведомляем сайдбар
                        if (isCdrMode) {
                          window.dispatchEvent(new Event('savedMessages:refresh'));
                        }

                        refetch().catch(console.error);
                        setAttachmentError('');
                      } catch (err: any) {
                        console.error(err);
                        setAttachmentError(err.message || 'Failed to process file.');
                      } finally {
                        pendingInputRef.current = '';
                        pendingFilesRef.current = [];
                      }
                    }}
                    className="text-sm text-[var(--text-primary)] hover:underline"
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>
          )}

          <ErrorBoundary>
            <LimitModal show={showLimitModal} onClose={() => setShowLimitModal(false)} />
          </ErrorBoundary>

          <ErrorBoundary>
            <DayLimitModal
              show={showDailyModal}
              onClose={() => setShowDailyModal(false)}
              used={usedDaily}
              limit={limits.dailyGenerations}
              dailyResetsAtLabel={dailyResetLabel}
            />
          </ErrorBoundary>

          <SaveProfileModal
            open={showSaveModal}
            onClose={() => setShowSaveModal(false)}
            aiResponse={aiResponseToSave}
            isNew={isNewProfile}
            folders={folders}
            onSave={async (name, aiResponse, comments, selectedFolder) => {
              const userId = session?.user?.id;
              if (!userId) {
                alert('User not logged in');
                return;
              }

              await saveProfile({
                user_id: userId,
                profile_name: name,
                chat_json: {
                  ai_response: aiResponse || '',
                  user_comments: comments,
                },
                saved_at: Date.now(),
                folder: selectedFolder ?? null,
              });

              setShowSaveModal(false);
              refetch?.();
            }}
            defaultProfileName={`Discernment Report #${Date.now()}`}
          />

          {ready && showStep1 && (
            <OnboardingSpotlight
              targetSelector="#ws-onb-anchor"
              title="Welcome to your workspace"
              body="This is your working area. The left sidebar hosts extra tools; the right sidebar is your technical zone."
              ctaLabel="Got it"
              hideSecondary
              onAccept={acceptStep1}
              onDismiss={dismissStep1}
            />
          )}

          {ready && showStep2 && (
            <OnboardingSpotlight
              targetSelector="#ws-input-panel"
              title="Compose and attach"
              body="Here you can attach an image or other materials, and send either a standard or your personalised command."
              ctaLabel="Got it"
              hideSecondary
              onAccept={acceptStep2}
              onDismiss={dismissStep2}
            />
          )}

          {ready && showStep3 && (
            <OnboardingSpotlight
              targetSelector="#ws-save-btn"
              title="Save your analysis"
              body="You can save any analysis by pressing Save."
              ctaLabel="Got it"
              hideSecondary
              onAccept={acceptStep3}
              onDismiss={dismissStep3}
            />
          )}

          {ready && showStep4 && (
            <OnboardingSpotlight
              targetSelector="#ws-save-modal-anchor"
              title="Enrich and store"
              body="Add comments, choose a name, download the report, and return to it anytime — it will live in Saved messages after you press Save."
              ctaLabel="Got it"
              hideSecondary
              onAccept={acceptStep4}
              onDismiss={dismissStep4}
            />
          )}

          {ready && showStep6 && (
            <OnboardingSpotlight
              targetSelector="#ws-cdrs-btn"
              title="Combine Discernment Reports"
              body="Merge from 2 up to 5 existing reports to get a broader analysis. Pick them from Saved messages in the left sidebar."
              ctaLabel="Got it"
              hideSecondary
              onAccept={acceptStep6}
              onDismiss={() => {}}
            />
          )}

          {ready && showFirstImageDrag && (
            <OnboardingSpotlight
              targetSelector="#ws-input-panel"
              title="AI Discernment by image"
              body="You’ve enabled image analysis. You can add a standard template, or ask your custom question for deeper insight."
              ctaLabel="Got it"
              hideSecondary
              onAccept={acceptFirstImageDrag}
              onDismiss={laterFirstImageDrag}
            />
          )}

          {overlay}
        </div>{' '}
        {/* закрываем z-10 обёртку */}
      </div>
    </>
  );
}
