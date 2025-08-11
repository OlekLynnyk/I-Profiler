// src/components/effects/BlackCognitiveSand.tsx
import Image from 'next/image';

export default function BlackCognitiveSand() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: '#0b0b0c' }}>
      <Image
        src="/images/bg-cognitive-sand-v1.webp"
        alt=""
        fill
        priority
        quality={100} // ← максимум качества
        sizes="100vw" // ← на весь вьюпорт
        className="object-cover select-none"
        aria-hidden
      />
    </div>
  );
}
