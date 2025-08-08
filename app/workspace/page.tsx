'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthProvider';
import dynamic from 'next/dynamic';
import HeaderBar from '@/app/components/HeaderBar';
import ChatBubble from '@/app/components/ChatBubble';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import { useUserPlan } from '@/app/hooks/useUserPlan';
import { Plus, SendHorizonal, X, Loader, ChevronDown, Image as ImageIcon } from 'lucide-react';
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

const LimitModal = dynamic(() => import('@/app/components/LimitModal'), { ssr: false });

const Sidebar = dynamic(() => import('./Sidebar'), {
  loading: () => <div className="p-8 text-[var(--text-secondary)]">Loading Sidebar...</div>,
  ssr: false,
});

const SidebarHelper = dynamic(() => import('./SidebarHelper'), {
  loading: () => <div className="p-8 text-[var(--text-secondary)]">Loading Helper...</div>,
  ssr: false,
});

export default function WorkspacePage() {
  const { session, user, isLoading } = useAuth();
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
  } = useChatLogic();

  const [refreshToken, setRefreshToken] = useState(0);
  const {
    plan: packageType,
    used: demoAttempts,
    hasReachedLimit: limitReached,
    hasReachedMonthlyLimit,
    refetch,
  } = useUserPlan(refreshToken);

  const [showLimitModal, setShowLimitModal] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHelperOpen, setIsHelperOpen] = useState(false);

  const {
    inputValue,
    setInputValue,
    attachedFiles,
    handleFileChange,
    handleFileRemove,
    hasErrors,
    error,
    resetInput,
  } = useChatInputState();

  const [attachmentError, setAttachmentError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const confirmRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { isDragging, overlay, setIsDragging } = useDragOverlay();

  const { isAtBottom } = useScrollObserver(bottomRef, scrollRef, historyLoaded);

  const { saveProfile } = useSavedProfiles();

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [aiResponseToSave, setAiResponseToSave] = useState<string>('');
  const [isNewProfile, setIsNewProfile] = useState(true);

  const [isImageActive, setIsImageActive] = useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const [isChatActive, setIsChatActive] = useState(false);
  const [chatMode, setChatMode] = useState<'none' | 'image' | 'chat'>('none');

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
    if (chatMode === 'none') {
      alert('Please select how you want to interact: Chat or Profiling.');
      return;
    }

    resetInput();

    try {
      const attachments = await Promise.all(
        attachedFiles.map(
          (file) =>
            new Promise<{ name: string; base64: string }>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve({ name: file.name, base64: reader.result as string });
              reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
              reader.readAsDataURL(file);
            })
        )
      );

      await handleGenerate(inputValue.trim(), attachments);
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

    if (e.dataTransfer.files.length) {
      const event = {
        target: { files: e.dataTransfer.files },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      handleFileChange(event);
      setIsDragging(false);

      // Автоматическая активация режима Image
      setIsImageActive(true);
      setIsChatActive(false);
      setChatMode('image');
      setProfilingMode(true);
    }
  };

  if (isLoading)
    return <div className="p-8 text-[var(--text-secondary)]">🔄 Loading session...</div>;
  if (!session) return <div className="p-8 text-[var(--text-secondary)]">❌ No access</div>;

  return (
    <>
      <SessionBridge />

      <div
        className="flex h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 relative overflow-hidden"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {isHelperOpen && (
          <ErrorBoundary>
            <SidebarHelper />
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

        <div className="flex-1 flex flex-col justify-center items-center pb-[160px]">
          <div
            className="w-full max-w-3xl flex-1 overflow-y-auto pt-[72px] px-4 sm:px-6 md:px-8 no-scrollbar"
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
                  <img src="/images/logo.png" alt="Logo" className="w-10 h-10 mb-1" />

                  {/* Основной текст */}
                  <p className="text-[20px] font-semibold text-center text-gray-700 dark:text-[var(--text-primary)]">
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
                      <div className="text-[var(--text-secondary)] text-xs">Loading message...</div>
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
                    onClick={() => setShowConfirm(true)}
                    className="text-xs text-[var(--text-secondary)] opacity-60 hover:opacity-100 transition"
                  >
                    Clear history
                  </button>
                </div>
              )}

              {isGenerating && (
                <div className="w-full text-left py-1 text-sm text-[var(--text-secondary)] animate-pulse">
                  Analysing...
                </div>
              )}
            </div>
          </div>

          <div className="fixed bottom-3 w-full px-3 sm:px-4 md:px-6">
            <div className="relative max-w-3xl mx-auto bg-[var(--card-bg)] rounded-3xl p-3 shadow-2xl">
              {attachedFiles.length > 0 && (
                <div className="flex gap-2 mb-2 flex-wrap">
                  {attachedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="relative w-20 h-20 rounded-xl overflow-hidden max-w-full sm:max-w-[80px]"
                    >
                      <img
                        src={URL.createObjectURL(file)}
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

              <div className="flex flex-col gap-0.5">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything"
                  disabled={isDragging}
                  className="w-full px-4 py-2 text-[clamp(0.875rem,1vw,1rem)] placeholder-[var(--text-secondary)] rounded-xl focus:outline-none focus:ring-0 bg-[var(--card-bg)] text-[var(--text-primary)] resize-none overflow-y-auto max-h-[192px]"
                />

                <div className="flex flex-wrap justify-between items-center w-full px-1 gap-2 mt-0.5">
                  <div className="flex flex-wrap gap-2 items-center">
                    <label className="cursor-pointer w-9 h-9 flex items-center justify-center bg-[var(--button-bg)] rounded-full shadow-sm hover:bg-[var(--button-hover-bg)] transition">
                      <Plus size={16} className="text-[var(--text-primary)]" />
                      <input
                        type="file"
                        className="hidden"
                        multiple
                        onChange={(e) => {
                          handleFileChange(e);
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
                        const next = !isImageActive;
                        setIsImageActive(next);
                        setChatMode(next ? 'image' : 'none');
                        setIsChatActive(false);
                        setProfilingMode(next);
                      }}
                      className={`
                      flex items-center gap-1 h-8 px-3
                      rounded-full shadow-sm transition
                      text-xs font-medium
                      ${
                        isImageActive
                          ? 'bg-[#C084FC] text-white hover:bg-[#a05adb]'
                          : 'bg-[var(--button-bg)] text-[var(--text-primary)] hover:bg-[var(--button-hover-bg)]'
                      }
                    `}
                      aria-label="Toggle Image Mode"
                    >
                      <ImageIcon size={14} />
                      Image
                    </button>

                    <button
                      type="button"
                      onClick={() => alert('Currently not available.')}
                      className="
                      flex items-center gap-1 h-8 px-3
                      rounded-full shadow-sm transition
                      bg-[var(--button-bg)] text-[var(--text-primary)]
                      hover:bg-[var(--button-hover-bg)]
                      text-xs font-medium
                    "
                      aria-label="LinkedIn Button"
                    >
                      <FaLinkedin className="w-3.5 h-3.5" />
                      LinkedIn
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
                        hover:bg-[var(--button-hover-bg)]
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
                          absolute bottom-12 left-0 w-40 rounded-lg shadow-lg
                          bg-[var(--card-bg)] text-[var(--text-primary)]
                          border border-[var(--card-border)]
                          z-50
                        "
                        >
                          <button
                            className={`w-full text-left px-4 py-2 text-xs hover:bg-[var(--surface-secondary)] transition ${
                              isChatActive ? 'text-[#C084FC]' : ''
                            }`}
                            onClick={() => {
                              const next = !isChatActive;
                              setIsChatActive(next);
                              setChatMode(next ? 'chat' : 'none');
                              setIsImageActive(false);
                              setShowMoreDropdown(false);
                            }}
                          >
                            💬 Chat
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-xs hover:bg-[var(--surface-secondary)] transition"
                            onClick={() => alert('Option 2 clicked')}
                          >
                            Option 2
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-xs hover:bg-[var(--surface-secondary)] transition"
                            onClick={() => alert('Option 3 clicked')}
                          >
                            Option 3
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={submit}
                    disabled={
                      limitReached ||
                      (!inputValue.trim() && attachedFiles.length === 0) ||
                      isGenerating
                    }
                    className={`
                    w-9 h-9 flex items-center justify-center
                    rounded-full
                    bg-[var(--button-bg)]
                    shadow-md
                    text-[var(--text-primary)]
                    hover:bg-[var(--button-hover-bg)]
                    transition
                    ${
                      limitReached ||
                      (!inputValue.trim() && attachedFiles.length === 0) ||
                      isGenerating
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
              H1NTED can make mistakes. Check{' '}
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
            fixed bottom-28 right-4 sm:right-8
            p-2 rounded-full
            bg-[var(--surface-secondary)]
            hover:bg-[var(--surface)]
            text-[var(--text-primary)]
            shadow-lg
            transition
            focus:outline-none
            focus-visible:ring
            focus-visible:ring-blue-300
            z-50
          "
            aria-label="Scroll to latest message"
          >
            <ChevronDown size={20} className="w-6 h-6" />
          </button>
        )}

        {showConfirm && (
          <div className="absolute inset-0 flex items-center justify-center z-50">
            <div
              ref={confirmRef}
              className="bg-[var(--card-bg)] text-[var(--text-primary)] rounded-xl px-5 py-3 shadow-md border border-[var(--card-border)] max-w-[350px] w-full text-sm"
            >
              <p className="text-left mb-3">Are you sure you want to delete the history?</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    clearMessages();
                    setShowConfirm(false);
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

        <SaveProfileModal
          open={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          aiResponse={aiResponseToSave}
          isNew={isNewProfile}
          onSave={async (name, aiResponse, comments) => {
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
            });

            setShowSaveModal(false);
            refetch?.();
          }}
          defaultProfileName={`Profiling #${Date.now()}`}
        />

        {overlay}
      </div>
    </>
  );
}
