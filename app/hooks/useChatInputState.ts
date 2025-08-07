import { useState } from 'react';

export function useChatInputState() {
  const [inputValue, setInputValue] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);

  const MAX_FILES = 3;
  const MAX_FILE_SIZE_MB = 10;
  const ALLOWED_TYPES = ['image/', 'application/pdf'];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    await addFiles(e.target.files);
    e.target.value = '';
  };

  const addFiles = async (files: FileList | File[]) => {
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

      if (
        !ALLOWED_TYPES.some((type) => file.type.startsWith(type)) &&
        file.type !== 'image/heic' &&
        !file.name.toLowerCase().endsWith('.heic')
      ) {
        newErrors.push(`${file.name} has unsupported type.`);
        continue;
      }

      if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
        try {
          if (typeof window === 'undefined') {
            throw new Error('HEIC conversion can only run in the browser.');
          }

          // ✅ Импорт heic2any
          const heic2any = (await import('heic2any')).default;

          // ✅ Конвертируем HEIC → JPEG
          const result = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.8,
          });

          let blob: Blob;
          if (Array.isArray(result)) {
            blob = result[0];
          } else {
            blob = result as Blob;
          }

          // ✅ Делаем ресайз и компрессию
          const resizedBlob = await resizeImage(blob, 1024, 'image/jpeg', 0.7);

          // ✅ Проверка итогового размера
          if (resizedBlob.size > 7.5 * 1024 * 1024) {
            newErrors.push(`File ${file.name} is too large even after compression.`);
            continue;
          }

          const convertedFile = new File([resizedBlob], file.name.replace(/\.heic$/i, '.jpg'), {
            type: 'image/jpeg',
          });

          console.log(`[DEBUG] HEIC converted and resized: ${convertedFile.name}`);

          newFiles.push(convertedFile);
        } catch (e) {
          console.error('Failed to convert HEIC file:', file.name, e);
          newErrors.push(`Failed to convert HEIC file: ${file.name}`);
          continue;
        }
      } else {
        newFiles.push(file);
      }
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

/**
 * ✅ Функция ресайза изображения
 *
 * @param blob входной Blob
 * @param maxWidth максимальная ширина в пикселях
 * @param mimeType целевой формат, напр. "image/jpeg"
 * @param quality число 0...1
 */
export async function resizeImage(
  blob: Blob,
  maxWidth: number,
  mimeType: string = 'image/jpeg',
  quality: number = 0.7
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = height * (maxWidth / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Failed to get canvas context'));

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Failed to create blob'));
          resolve(blob);
        },
        mimeType,
        quality
      );
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}
