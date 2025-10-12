import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { File } from 'lucide-react';

function isFileDrag(e: DragEvent) {
  const types = e.dataTransfer?.types;
  if (!types) return false;
  // В браузерах types — DOMStringList/ArrayLike
  for (let i = 0; i < types.length; i++) {
    if (types[i] === 'Files') return true;
  }
  return false;
}

export function useDragOverlay() {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      if (!isFileDrag(e)) return; // ⬅️ важно: игнорим не-файловый DnD
      e.preventDefault();
      dragCounter.current++;
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      if (!isFileDrag(e)) return; // ⬅️
      e.preventDefault();
      dragCounter.current--;
      if (dragCounter.current <= 0) setIsDragging(false);
    };

    const handleDrop = (e: DragEvent) => {
      if (!isFileDrag(e)) return; // ⬅️
      e.preventDefault();
      dragCounter.current = 0;
      setIsDragging(false);
    };

    const handleDragOver = (e: DragEvent) => {
      // Разрешаем drop ТОЛЬКО для файлов, чтобы системный оверлей работал;
      // внутренний DnD не трогаем вообще.
      if (!isFileDrag(e)) return; // ⬅️
      e.preventDefault();
    };

    // Ниже — безопасные «сбросы» состояния; они не мешают внутреннему DnD
    const handleDragEnd = () => {
      dragCounter.current = 0;
      setIsDragging(false);
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        dragCounter.current = 0;
        setIsDragging(false);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragend', handleDragEnd);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragend', handleDragEnd);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const overlay = isDragging
    ? createPortal(
        <motion.div
          className="fixed inset-0 z-50 backdrop-blur-md bg-black/10 flex items-center justify-center pointer-events-none"
          data-interactive="true" /* ⬅️ не блокируем клики глобальными стилями */
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
        >
          <div className="flex flex-col items-center text-center">
            <File className="w-12 h-12 text-white mb-4" />
            <p className="text-white text-xl font-semibold">Drop your files here</p>
          </div>
        </motion.div>,
        document.body
      )
    : null;

  return { isDragging, overlay, setIsDragging };
}
