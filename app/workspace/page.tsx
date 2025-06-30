'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthProvider';
import dynamic from 'next/dynamic';
import HeaderBar from '@/app/components/HeaderBar';
import ChatBubble from '@/app/components/ChatBubble';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import { useUserPlan } from '@/app/hooks/useUserPlan';
import { Plus, SendHorizonal, X, Loader, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useChatLogic } from '@/app/hooks/useChatLogic';
import React from 'react';
import { useChatInputState } from '@/app/hooks/useChatInputState';
import { useDragOverlay } from '@/app/hooks/useDragOverlay';
import { useScrollObserver } from '@/app/hooks/useScrollObserver';

const LimitModal = dynamic(
  () => import('@/app/components/LimitModal'),
  { ssr: false }
);

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

  useEffect(() => {
    if (hasReachedMonthlyLimit) {
      setShowLimitModal(true);
    }
  }, [hasReachedMonthlyLimit]);

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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showConfirm]);

  const handleLogoutConfirm = () => {
    if (window.confirm('Are you sure you want to return to the home page?')) router.push('/');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submit = async () => {
    const hasInput = inputValue.trim() !== '';
    const hasFiles = attachedFiles.length > 0;
    if (!hasInput && !hasFiles) return;

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
      resetInput();
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
      const event = { target: { files: e.dataTransfer.files } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(event);
      setIsDragging(false);
    }
  };

  if (isLoading) return <div className="p-8 text-[var(--text-secondary)]">🔄 Loading session...</div>;
  if (!session) return <div className="p-8 text-[var(--text-secondary)]">❌ No access</div>;

  return (
    <div
      className="flex h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 relative overflow-hidden"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {isHelperOpen && (
        <ErrorBoundary>
          <SidebarHelper onClose={() => setIsHelperOpen(false)} />
        </ErrorBoundary>
      )}
      {isSidebarOpen && (
        <ErrorBoundary>
          <Sidebar
            onClose={() => setIsSidebarOpen(false)}
            packageType={packageType}
            refreshToken={refreshToken}
          />
        </ErrorBoundary>
      )}

      <HeaderBar
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onOpenHelper={() => setIsHelperOpen(true)}
        onLogout={handleLogoutConfirm}
      />

      <div className="flex-1 flex flex-col items-center pb-[160px]">
        <div
          className="w-full max-w-3xl flex-1 overflow-y-auto pt-[72px] px-4 sm:px-6 md:px-8 no-scrollbar"
          ref={scrollRef}
        >
          <div className="flex flex-col items-start justify-start py-4">
            {errorMessage && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-lg text-sm">
                {errorMessage}
              </div>
            )}

            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-sm text-[var(--text-secondary)] italic text-center w-full py-4"
              >
                Hi, {userName} — your next discovery is just one click away.
              </motion.div>
            )}

            {messages.map((msg, i) => (
              <React.Fragment key={`${msg.id}-${msg.timestamp}`}>
                <Suspense fallback={<div className="text-[var(--text-secondary)] text-xs">Loading message...</div>}>
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
              <div className="w-full text-left py-1 text-[var(--text-secondary)] animate-pulse">
                ...
              </div>
            )}
          </div>
        </div>

        <div className="fixed bottom-3 w-full px-3 sm:px-4 md:px-6">
          <div className="relative max-w-3xl mx-auto bg-[var(--card-bg)] rounded-3xl p-4 shadow-2xl">
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
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything"
                disabled={isDragging}
                className="w-full px-4 py-3 text-[clamp(0.875rem,1vw,1rem)] rounded-xl focus:outline-none focus:ring-0 bg-[var(--card-bg)] text-[var(--text-primary)] resize-none overflow-y-auto max-h-[192px]"
              />

              <div className="flex justify-between w-full px-1">
                <label className="cursor-pointer w-10 h-10 flex items-center justify-center bg-[var(--surface-secondary)] rounded-full shadow-sm hover:bg-[var(--surface)] transition">
                  <Plus size={16} className="text-[var(--text-secondary)]" />
                  <input type="file" className="hidden" multiple onChange={handleFileChange} />
                </label>

                <button
                  onClick={submit}
                  disabled={limitReached || (!inputValue.trim() && attachedFiles.length === 0) || isGenerating}
                  className={`p-3 rounded-full bg-[var(--surface-secondary)] shadow-md text-[var(--text-primary)] hover:bg-[var(--surface)] transition ${
                    limitReached || (!inputValue.trim() && attachedFiles.length === 0) || isGenerating
                      ? 'cursor-not-allowed opacity-50'
                      : ''
                  }`}
                  aria-label="Start Generation"
                >
                  {isGenerating ? <Loader size={18} className="animate-spin" /> : <SendHorizonal size={18} />}
                </button>
              </div>

              {hasErrors && <p className="text-xs text-[var(--danger)] px-2 pt-1">{error}</p>}
              {attachmentError && <p className="text-xs text-[var(--danger)] px-2 pt-1">{attachmentError}</p>}
            </div>
          </div>

          <div className="mt-4 text-center text-xs text-[var(--text-secondary)]">
            I,Profiler can make mistakes. Check important info. See{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--text-primary)]">
              Terms of Use
            </a>{' '}
            and{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--text-primary)]">
              Privacy Policy
            </a>.
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

      {overlay}
    </div>
  );
}
