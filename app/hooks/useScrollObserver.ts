import { useEffect, useState } from 'react';

export function useScrollObserver(
  bottomRef: React.RefObject<HTMLDivElement | null>,
  scrollContainerRef: React.RefObject<HTMLDivElement | null>,
  historyLoaded: boolean
) {
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    if (!bottomRef.current || !scrollContainerRef.current || !historyLoaded) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsAtBottom(entry.isIntersecting);
      },
      {
        root: scrollContainerRef.current,
        threshold: 1.0,
      }
    );

    observer.observe(bottomRef.current);

    return () => {
      observer.disconnect();
    };
  }, [bottomRef, scrollContainerRef, historyLoaded]);

  return { isAtBottom };
}
