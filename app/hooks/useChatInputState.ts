// ✅ useChatInputState.ts — с восстановлением файлов из localStorage
import { useState, useEffect } from 'react';

export function useChatInputState() {
  const [inputValue, setInputValue] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);

  const MAX_FILES = 3;
  const MAX_FILE_SIZE_MB = 10;
  const ALLOWED_TYPES = ['image/', 'application/pdf'];

  const LOCAL_STORAGE_KEY = 'attached_files';

  useEffect(() => {
    const loadFilesFromStorage = async () => {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!stored) return;

      try {
        const parsed = JSON.parse(stored) as { name: string; type: string; base64: string }[];
        const files = await Promise.all(
          parsed.map(
            (fileData) =>
              fetch(fileData.base64)
                .then(res => res.blob())
                .then(blob => new File([blob], fileData.name, { type: fileData.type }))
          )
        );
        setAttachedFiles(files);
      } catch (err) {
        console.error('Failed to restore attached files:', err);
      }
    };

    loadFilesFromStorage();
  }, []);

  useEffect(() => {
    const serializeFiles = async () => {
      const serialized = await Promise.all(
        attachedFiles.map(
          (file) =>
            new Promise<{ name: string; type: string; base64: string }>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve({ name: file.name, type: file.type, base64: reader.result as string });
              reader.onerror = reject;
              reader.readAsDataURL(file);
            })
        )
      );
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serialized));
    };

    if (attachedFiles.length > 0) {
      serializeFiles();
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [attachedFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    addFiles(e.target.files);
    e.target.value = '';
  };

  const addFiles = (files: FileList | File[]) => {
    const newErrors: string[] = [];
    const newFiles: File[] = [];

    for (const file of Array.from(files)) {
      if (attachedFiles.length + newFiles.length >= MAX_FILES) {
        newErrors.push(`Limit: ${MAX_FILES} files.`);
        break;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        newErrors.push(`${file.name} is too large (max ${MAX_FILE_SIZE_MB}MB)`);
        continue;
      }
      if (!ALLOWED_TYPES.some((type) => file.type.startsWith(type))) {
        newErrors.push(`${file.name} has unsupported type.`);
        continue;
      }
      newFiles.push(file);
    }

    if (newFiles.length > 0) {
      setAttachedFiles((prev) => [...prev, ...newFiles]);
    }

    setFileErrors(newErrors);
  };

  const handleFileRemove = (file: File) => {
    setAttachedFiles((prev) => prev.filter((f) => f !== file));
  };

  const resetInput = () => {
    setInputValue('');
    setAttachedFiles([]);
    setFileErrors([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const setFileErrorMessage = (msg: string) => {
    setFileErrors([msg]);
  };

  return {
    inputValue,
    setInputValue,
    attachedFiles,
    handleFileChange,
    handleFileRemove,
    hasErrors: fileErrors.length > 0,
    error: fileErrors[0] || '',
    resetInput,
    setFileErrorMessage,
  };
}
