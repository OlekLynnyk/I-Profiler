'use client';

import { motion } from 'framer-motion';
import { Copy, ThumbsUp, ThumbsDown, FileText } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip';

interface Attachment {
  name: string;
  base64: string;
}

interface CdrRef {
  id: string;
  profile_name: string;
}

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  index: number;
  messageId: string;
  status?: 'pending' | 'done' | 'error';
  rating?: 'up' | 'down' | null;
  onRate?: (messageId: string, rating: 'up' | 'down' | null) => void;
}

export default function ChatBubble({
  role,
  content,
  index,
  messageId,
  status,
  rating,
  onRate,
}: ChatBubbleProps) {
  const isUser = role === 'user';
  const [displayedText, setDisplayedText] = useState(isUser ? '' : '');
  const [copied, setCopied] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false); // открыто ли меню выбора голосов
  const [isSpeaking, setIsSpeaking] = useState(false); // сейчас ли идёт озвучка
  const voiceWrapRef = useRef<HTMLDivElement>(null); // ссылка на блок кнопки 🔊

  let attachments: Attachment[] | null = null;
  let cdrs: CdrRef[] | null = null;
  let text = '';

  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === 'object' && 'text' in parsed) {
      text = parsed.text || '';
      if (Array.isArray(parsed.attachments)) {
        attachments = parsed.attachments;
      }
      if (Array.isArray(parsed.cdrs)) {
        cdrs = parsed.cdrs as CdrRef[];
      }
    } else {
      text = content;
    }
  } catch {
    text = content;
  }

  if (!text && isUser) {
    text = '';
  }

  useEffect(() => {
    if (isUser) return;
    if (attachments?.length) {
      setDisplayedText(text);
      return;
    }

    const connection = (navigator as any).connection;
    const isSlow = connection?.effectiveType && ['2g', '3g'].includes(connection.effectiveType);
    const isWeak = connection?.downlink && connection.downlink < 0.8; // менее 0.8 Mbps
    const isOffline = typeof navigator.onLine === 'boolean' && !navigator.onLine;

    // ✅ адаптивная скорость печати
    const msPerChar = isSlow || isWeak || isOffline ? 25 : 10;

    const startedAtRef = { current: performance.now() };

    const render = () => {
      const elapsed = performance.now() - startedAtRef.current;
      const targetLen = Math.min(text.length, Math.floor(elapsed / msPerChar));
      setDisplayedText(text.slice(0, targetLen));
      return targetLen;
    };

    // первый рендер
    render();

    // плавное обновление в активной вкладке
    const interval = setInterval(() => {
      const done = render() >= text.length;
      if (done) clearInterval(interval);
    }, 16);

    // «догон» при возврате из фонового режима
    const onVis = () => {
      if (!document.hidden) {
        const done = render() >= text.length;
        if (done) clearInterval(interval);
      }
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [text, isUser, attachments?.length]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleRate = (type: 'up' | 'down') => {
    const newRating = rating === type ? null : type;
    onRate?.(messageId, newRating);
  };

  useEffect(() => {
    const stopOnBlur = () => speechSynthesis.cancel();
    window.addEventListener('blur', stopOnBlur);
    return () => window.removeEventListener('blur', stopOnBlur);
  }, []);

  // ✅ Отслеживаем состояние речи каждые 200мс
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const id = setInterval(() => {
      setIsSpeaking(window.speechSynthesis.speaking);
    }, 200);
    return () => clearInterval(id);
  }, []);

  // ✅ Закрытие меню при клике вне кнопки
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!voiceOpen) return;
      if (!voiceWrapRef.current) return;
      if (!voiceWrapRef.current.contains(e.target as Node)) {
        setVoiceOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [voiceOpen]);

  // ✅ Прогрев голосов (чтобы getVoices() возвращал список во всех браузерах)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Прогреваем список голосов для Safari/iOS
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (!voices.length) {
          // пробуем через 300мс повторно, если ещё не подгрузились
          setTimeout(loadVoices, 300);
        }
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`w-full py-1 flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className="flex flex-col max-w-full sm:max-w-[80%] text-left">
        {/* ✅ CDRs — бейджи выбранных отчётов пользователя */}
        {isUser && cdrs && cdrs.length > 0 && (
          <div className="flex gap-2 mb-2 flex-wrap">
            {cdrs.map((it) => (
              <span
                key={it.id}
                className="inline-flex items-center gap-2 px-2 py-1 text-xs rounded-full
                           bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--card-border)]"
                title={it.profile_name}
              >
                <span className="max-w-[220px] truncate">{it.profile_name}</span>
              </span>
            ))}
          </div>
        )}

        {/* ✅ ATTACHMENTS — квадратные превью над bubble */}
        {attachments && attachments.length > 0 && (
          <div className="flex flex-col gap-2 mb-2">
            {attachments.map((file, idx) =>
              file.base64.startsWith('data:image/') ? (
                <img
                  key={`${file.name}-${idx}`}
                  src={file.base64}
                  alt={file.name}
                  loading="lazy"
                  className="
                    w-20 h-20
                    sm:w-24 sm:h-24
                    rounded-lg
                    object-cover
                    border border-gray-300
                    shadow-sm
                  "
                />
              ) : null
            )}
          </div>
        )}

        {/* ✅ TEXT BUBBLE */}
        <div
          className={`text-sm whitespace-pre-wrap px-4 py-2 rounded-xl text-[var(--text-primary)] shadow-none
            ${
              isUser
                ? 'bg-[var(--vanilla)] border border-gray-300 border-opacity-20'
                : 'bg-transparent border-none'
            }
          `}
          aria-live={isUser ? undefined : 'polite'}
        >
          <p className="text-left leading-relaxed whitespace-pre-wrap break-words">
            {(isUser ? text : displayedText) || '...'}
          </p>

          {/* ✅ Non-image attachments остаются внутри bubble */}
          {attachments && attachments.length > 0 && (
            <ul className="space-y-2 mt-2">
              {attachments.map(
                (file, idx) =>
                  !file.base64.startsWith('data:image/') && (
                    <li
                      key={`${file.name}-link-${idx}`}
                      className="flex items-start gap-2 text-xs text-[var(--text-primary)]"
                    >
                      <FileText size={14} />
                      <a
                        href={file.base64}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline break-all hover:text-[var(--accent)]"
                      >
                        {file.name}
                      </a>
                    </li>
                  )
              )}
            </ul>
          )}
        </div>

        {/* ✅ CONTROLS */}
        {!isUser && (
          <div className="flex gap-2 mt-1 ml-4 text-[var(--text-secondary)] text-xs items-center">
            {status === 'pending' && <span className="animate-pulse">...</span>}
            {status === 'error' && <span className="text-[var(--danger)]">Error</span>}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    aria-label="Copy to clipboard"
                    className="text-[var(--text-secondary)] transition focus:outline-none focus-visible:ring focus-visible:ring-blue-300 rounded"
                    tabIndex={0}
                    onClick={handleCopy}
                  >
                    <Copy size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  sideOffset={6}
                  className="bg-[var(--surface-tooltip)] text-[var(--text-tooltip)] text-xs px-2 py-1 rounded shadow"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </TooltipContent>
              </Tooltip>

              {/* ✅ Read Aloud Button with Voice Menu */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div ref={voiceWrapRef} className="relative ml-2">
                    <button
                      aria-label={isSpeaking ? 'Stop reading' : 'Read aloud options'}
                      className="hover:text-blue-500 transition focus:outline-none focus-visible:ring focus-visible:ring-blue-300 rounded"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (typeof window === 'undefined' || !window.speechSynthesis) return;

                        // Если уже говорит — стоп, без меню
                        if (speechSynthesis.speaking) {
                          speechSynthesis.cancel();
                          setIsSpeaking(false);
                          setVoiceOpen(false);
                          return;
                        }

                        // Иначе открываем/закрываем меню
                        setVoiceOpen((v) => !v);
                      }}
                    >
                      {/* 🔊 иконка громкости */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-volume-2"
                      >
                        <path d="M11 5l-6 4H2v6h3l6 4V5z" />
                        <path d="M19.07 4.93a10 10 0 010 14.14" />
                        <path d="M15.54 8.46a5 5 0 010 7.07" />
                      </svg>
                    </button>

                    {/* 🗣️ Voice Selection Menu */}
                    <div
                      className={`absolute ${voiceOpen ? '' : 'hidden'} z-50
              bg-[var(--surface)] border border-gray-200 rounded-lg shadow-md
              p-2 text-xs w-44
              bottom-full mb-2 left-1/2 -translate-x-1/2`}
                    >
                      {[
                        {
                          id: 'uk-female',
                          label: '🇬🇧 British Female',
                          filter: (v: SpeechSynthesisVoice) =>
                            v.lang === 'en-GB' && /Serena|Female/i.test(v.name),
                        },
                        {
                          id: 'us-male',
                          label: '🇺🇸 American Male',
                          filter: (v: SpeechSynthesisVoice) =>
                            v.lang === 'en-US' && /Alex|Male/i.test(v.name),
                        },
                        {
                          id: 'ru-female',
                          label: '🇷🇺 Russian',
                          filter: (v: SpeechSynthesisVoice) => v.lang === 'ru-RU',
                        },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          className="block w-full text-left px-2 py-1 hover:bg-[var(--accent-faint)] rounded transition"
                          onClick={() => {
                            try {
                              if (typeof window.speechSynthesis === 'undefined') {
                                alert('Speech synthesis is not supported in this browser.');
                                return;
                              }

                              speechSynthesis.cancel();

                              const utter = new SpeechSynthesisUtterance(text);
                              const voices = speechSynthesis.getVoices();
                              const voice = voices.find(opt.filter);

                              if (voice) {
                                utter.voice = voice;
                                utter.lang = voice.lang;
                              }

                              utter.rate = 1;
                              utter.pitch = 1;
                              speechSynthesis.speak(utter);

                              // ✅ начинаем воспроизведение
                              utter.onstart = () => setIsSpeaking(true);
                              utter.onend = () => setIsSpeaking(false);
                              speechSynthesis.speak(utter);
                              setVoiceOpen(false);
                            } catch (e) {
                              console.warn('Speech synthesis failed:', e);
                            }
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </TooltipTrigger>

                <TooltipContent
                  side="bottom"
                  sideOffset={6}
                  className="bg-[var(--surface-tooltip)] text-[var(--text-tooltip)] text-xs px-2 py-1 rounded shadow"
                >
                  Read aloud
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    aria-label="Mark as helpful"
                    className={`hover:text-green-500 transition focus:outline-none focus-visible:ring focus-visible:ring-blue-300 rounded ${
                      rating === 'up' ? 'text-green-600' : ''
                    }`}
                    tabIndex={0}
                    onClick={() => handleRate('up')}
                  >
                    <ThumbsUp size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  sideOffset={6}
                  className="bg-[var(--surface-tooltip)] text-[var(--text-tooltip)] text-xs px-2 py-1 rounded shadow"
                >
                  {rating === 'up' ? 'Change rating' : 'Helpful'}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    aria-label="Mark as not helpful"
                    className={`hover:text-red-500 transition focus:outline-none focus-visible:ring focus-visible:ring-blue-300 rounded ${
                      rating === 'down' ? 'text-red-600' : ''
                    }`}
                    tabIndex={0}
                    onClick={() => handleRate('down')}
                  >
                    <ThumbsDown size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  sideOffset={6}
                  className="bg-[var(--surface-tooltip)] text-[var(--text-tooltip)] text-xs px-2 py-1 rounded shadow"
                >
                  {rating === 'down' ? 'Change rating' : 'Not helpful'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </motion.div>
  );
}
