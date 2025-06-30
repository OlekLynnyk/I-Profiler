import { useState } from 'react';

export function useChatUIState() {
  const [inputValue, setInputValue] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHelperOpen, setIsHelperOpen] = useState(false);

  return {
    inputValue,
    setInputValue,
    attachedFile,
    setAttachedFile,
    isSidebarOpen,
    setIsSidebarOpen,
    isHelperOpen,
    setIsHelperOpen,
  };
}
