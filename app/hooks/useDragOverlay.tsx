import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { File } from 'lucide-react';

export function useDragOverlay() {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current++;
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current--;
      if (dragCounter.current <= 0) {
        setIsDragging(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      setIsDragging(false);
    };

    const handleDragEnd = (e: DragEvent) => {
      dragCounter.current = 0;
      setIsDragging(false);
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.relatedTarget === null) {
        dragCounter.current = 0;
        setIsDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      if (!e.dataTransfer || e.dataTransfer.types.length === 0) {
        dragCounter.current = 0;
        setIsDragging(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        dragCounter.current = 0;
        setIsDragging(false);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!e.buttons) {
        dragCounter.current = 0;
        setIsDragging(false);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);
    window.addEventListener('dragend', handleDragEnd);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('dragend', handleDragEnd);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const overlay = isDragging
    ? createPortal(
        <motion.div
          className="fixed inset-0 z-50 backdrop-blur-md bg-black/10 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
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
