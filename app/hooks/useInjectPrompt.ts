// hooks/useInjectPrompt.ts
'use client';

export function useInjectPrompt() {
  return (text: string) => {
    const textarea = document.querySelector(
      'textarea[placeholder="Ask anything"]'
    ) as HTMLTextAreaElement | null;
    if (!textarea) {
      console.warn('Prompt injection failed: input not found');
      return;
    }
    textarea.value = text;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.focus();
  };
}
