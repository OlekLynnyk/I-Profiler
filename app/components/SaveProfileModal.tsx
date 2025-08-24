'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import { createPortal } from 'react-dom'; // ✅ добавлено

// ✅ Добавлено: AmbientBackdrop — ничего не выносится в отдельный файл
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
          className="w-[88vmin] max-w-[min(88vmin,1600px)] h-auto object-contain opacity-[0.0050]"
          style={{
            filter: 'contrast(1.05) brightness(0.95)',
            mixBlendMode: 'multiply',
            maskImage: 'radial-gradient(60% 60% at 50% 45%, #000 60%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(60% 60% at 50% 45%, #000 60%, transparent 100%)',
          }}
        />
      </div>
    </div>
  );
}

interface SaveProfileModalProps {
  open: boolean;
  onClose: () => void;
  aiResponse: string;
  onSave: (name: string, aiResponse: string, comments: string) => Promise<void>;
  defaultProfileName?: string;
  readonly?: boolean;
  isNew?: boolean; // новый флаг
}

export default function SaveProfileModal({
  open,
  onClose,
  aiResponse: initialAiResponse,
  onSave,
  defaultProfileName = 'Profiling #1',
  readonly = false,
  isNew = false,
}: SaveProfileModalProps) {
  const [profileName, setProfileName] = useState(defaultProfileName);
  const [aiResponse, setAiResponse] = useState(initialAiResponse || '');
  const [isEditing, setIsEditing] = useState(!readonly);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (open) {
      setProfileName(defaultProfileName);
      setAiResponse(initialAiResponse || '');
      setIsEditing(!readonly);
      setHasChanges(isNew);
    }
  }, [open, defaultProfileName, initialAiResponse, readonly, isNew]);

  useEffect(() => {
    if (isNew) {
      setHasChanges(true);
    } else {
      const changed =
        profileName.trim() !== defaultProfileName.trim() ||
        aiResponse.trim() !== (initialAiResponse || '').trim();
      setHasChanges(changed);
    }
  }, [profileName, aiResponse, defaultProfileName, initialAiResponse, isNew]);

  const handleSave = async () => {
    if (hasChanges) {
      await onSave(profileName.trim() || defaultProfileName, aiResponse.trim(), '');
    }
    onClose();
  };

  const handleDownload = () => {
    const doc = new jsPDF({
      unit: 'pt',
      format: 'a4',
    });

    doc.setFont('courier', 'normal');
    doc.setFontSize(14);
    doc.text(`Profile name: ${profileName}`, 40, 60);

    doc.setFontSize(12);
    doc.text('AI Response:', 40, 90);
    doc.setFontSize(10);
    doc.text(doc.splitTextToSize(aiResponse || '-', 500), 40, 110);

    doc.save(`${profileName}.pdf`);
  };

  const handleOutsideClick = async () => {
    if (hasChanges) {
      const confirmSave = window.confirm('You have unsaved changes. Do you want to save them?');
      if (confirmSave) {
        await handleSave();
      }
    } else {
      onClose();
    }
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-center items-center bg-black/30 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOutsideClick}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="
              relative
              bg-[var(--background)]
              text-[var(--text-primary)]
              rounded-xl
              shadow-xl
              w-[92vw] md:w-[75vw] max-w-[750px]
              max-h-[95vh]
              overflow-hidden
              p-6 sm:p-10
              flex flex-col
            "
            style={{ minHeight: '700px' }}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            {/* ✅ Добавлено: фон с логотипом */}
            <AmbientBackdrop src="/images/ambient.png" />

            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-normal text-[var(--text-secondary)]">Name:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="
                      bg-transparent
                      text-sm
                      font-normal
                      text-[var(--text-primary)]
                      border-none
                      outline-none
                      placeholder:text-[var(--text-secondary)]
                    "
                    placeholder="Profile name"
                  />
                ) : (
                  <span className="text-sm font-normal text-[var(--text-primary)]">
                    {profileName}
                  </span>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  aria-label="Download PDF"
                >
                  <Download size={20} />
                </button>
                <button
                  onClick={onClose}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  aria-label="Close Modal"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:gap-6 flex-grow overflow-hidden">
              {isEditing ? (
                <textarea
                  value={aiResponse}
                  onChange={(e) => setAiResponse(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="
                    w-full
                    bg-transparent
                    text-sm
                    text-[var(--text-primary)]
                    p-3
                    overflow-y-auto
                    no-scrollbar
                    resize-none
                    placeholder:text-[var(--text-secondary)]
                    focus:outline-none
                    flex-grow
                    min-h-[300px]
                  "
                  placeholder="Enter profile content here..."
                />
              ) : (
                <div
                  className="
                    text-sm
                    text-[var(--text-primary)]
                    whitespace-pre-wrap
                    overflow-y-auto
                    no-scrollbar
                    p-3
                    flex-grow
                    min-h-[300px]
                  "
                >
                  {aiResponse}
                </div>
              )}
            </div>

            {isEditing && (
              <div className="flex justify-between mt-6">
                <button
                  onClick={onClose}
                  className="
                    text-sm
                    text-[var(--text-secondary)]
                    hover:text-[var(--text-primary)]
                    transition
                    bg-transparent
                    border-none
                    p-0
                    m-0
                    rounded-none
                  "
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="
                    text-sm
                    text-[var(--text-primary)]
                    hover:text-[var(--text-secondary)]
                    transition
                    bg-transparent
                    border-none
                    p-0
                    m-0
                    rounded-none
                  "
                >
                  Save
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    typeof document !== 'undefined' ? document.body : ({} as HTMLElement)
  );
}
