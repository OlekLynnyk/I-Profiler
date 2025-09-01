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

    // 1) Корректно проставляем value через нативный сеттер (чтобы React onChange не слетал)
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
    setter ? setter.call(textarea, text) : (textarea.value = text);

    // 2) Диспатчим input, чтобы React поднял новое значение в state
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    const len = textarea.value.length;
    const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent);
    try {
      if (!isIOS) textarea.setSelectionRange(len, len);
    } catch {}

    // 4) Мгновенный и отложенный ресайз — закрывает баг "не расширяется до пробела"
    const lineHeight = 24;
    const maxHeight = lineHeight * 8;

    const resize = () => {
      textarea.style.height = 'auto';
      const h = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
      textarea.style.height = `${h}px`;
    };

    // сразу и в следующий(ие) кадр(ы) — чтобы поймать актуальный scrollHeight после layout
    resize();
    const r1 = requestAnimationFrame(resize);
    const r2 = requestAnimationFrame(resize);
    // на всякий пожарный — если layout задержится
    setTimeout(resize, 0);

    // очистка не обязательна тут, но пусть будет:
    // return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
  };
}
