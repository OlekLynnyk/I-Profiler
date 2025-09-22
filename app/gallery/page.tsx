'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import GlobalLoading from '@/app/loading';

// =============================
// Pininfarina Mosaic Gallery (App Router page)
// =============================
// Правки по ТЗ:
// - 50 изображений, рандом при каждой загрузке, мозаика без швов.
// - Лоадер заменён на GlobalLoading и показывается до ПОЛНОЙ предзагрузки фото.
// - 1-й клик (когда сайдбар закрыт) — подъём; 2-й клик/клик по i — открыть сайдбар.
// - Когда сайдбар открыт: клик по любой карточке обновляет контент сайдбара (не закрывает его).
// - Кнопка закрытия — крестик (X), Esc также закрывает.
// - Ширина сайдбара: переключатель 1/3 (по умолчанию) ↔ 1/4, мягкая анимация.
// - Заголовок «H1NTED Gallery» в шапке.

// -----------------------------
// ДАННЫЕ
// -----------------------------
// Источник данных демонстрационный. В проде используйте свой CDN/Supabase.

type ImageItem = {
  id: string;
  src: string;
  title: string;
  description: string;
};

const BASE_IMAGES: ImageItem[] = [
  {
    id: '1',
    src: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop',
    title: 'Linea 01',
    description: 'Гладкая поверхность, холодный хром, диагональная динамика.',
  },
  {
    id: '2',
    src: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1200&auto=format&fit=crop',
    title: 'Linea 02',
    description: 'Мягкий свет и графитовый градиент — премиум настроение.',
  },
  {
    id: '3',
    src: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop',
    title: 'Linea 03',
    description: 'Купольные формы, отражения, высокая полировка.',
  },
  {
    id: '4',
    src: 'https://images.unsplash.com/photo-1493238792000-8113da705763?q=80&w=1200&auto=format&fit=crop',
    title: 'Linea 04',
    description: 'Тонкие ребра, продольные линии, аэродинамика.',
  },
  {
    id: '5',
    src: 'https://images.unsplash.com/photo-1520975661595-6453be3f7070?q=80&w=1200&auto=format&fit=crop',
    title: 'Linea 05',
    description: 'Контролируемая асимметрия, спокойная геометрия.',
  },
  {
    id: '6',
    src: 'https://images.unsplash.com/photo-1520952525235-33dfc1b8a1dc?q=80&w=1200&auto=format&fit=crop',
    title: 'Linea 06',
    description: 'Светотень с мягким падением — ощущение скорости.',
  },
  {
    id: '7',
    src: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1200&auto=format&fit=crop',
    title: 'Linea 07',
    description: 'Текстуры металла и стекла, уверенная простота.',
  },
  {
    id: '8',
    src: 'https://images.unsplash.com/photo-1520975808909-2bcf4a6bdfa2?q=80&w=1200&auto=format&fit=crop',
    title: 'Linea 08',
    description: 'Сечение форм, острые и мягкие грани в балансе.',
  },
  {
    id: '9',
    src: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?q=80&w=1200&auto=format&fit=crop',
    title: 'Linea 09',
    description: 'Городской свет и плотная композиция.',
  },
  {
    id: '10',
    src: 'https://images.unsplash.com/photo-1493238792000-8113da705763?q=80&w=1200&auto=format&fit=crop',
    title: 'Linea 10',
    description: 'Вертикальные рёбра, резкая грань и гладкая поверхность.',
  },
  {
    id: '11',
    src: 'https://images.unsplash.com/photo-1483721310020-03333e577078?q=80&w=1200&auto=format&fit=crop',
    title: 'Linea 11',
    description: 'Студийная чистота, минимализм без компромиссов.',
  },
  {
    id: '12',
    src: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=1200&auto=format&fit=crop',
    title: 'Linea 12',
    description: 'Тонкие рефлексы, инженерная точность линий.',
  },
  {
    id: '13',
    src: 'https://images.unsplash.com/photo-1474433188271-d3f339f41911?q=80&w=1200&auto=format&fit=crop',
    title: 'Linea 13',
    description: 'Пересечение траекторий, динамика переходов.',
  },
  {
    id: '14',
    src: 'https://images.unsplash.com/photo-1451188502541-13943edb6acb?q=80&w=1200&auto=format&fit=crop',
    title: 'Linea 14',
    description: 'Световой рез, тонкая грань и чистая плоскость.',
  },
  {
    id: '15',
    src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop',
    title: 'Linea 15',
    description: 'Глубина пространства и мягкая перспектива.',
  },
  {
    id: '16',
    src: 'https://images.unsplash.com/photo-1468276311594-df7cb65d8df6?q=80&w=1200&auto=format&fit=crop',
    title: 'Linea 16',
    description: 'Ламинарные потоки света, плавные дуги.',
  },
  {
    id: '17',
    src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
    title: 'Linea 17',
    description: 'Гармония матовых и глянцевых поверхностей.',
  },
  {
    id: '18',
    src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop',
    title: 'Linea 18',
    description: 'Чёткая ось симметрии и взвешенные массы.',
  },
  {
    id: '19',
    src: 'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?q=80&w=1200&auto=format&fit=crop',
    title: 'Linea 19',
    description: 'Техника + поэзия формы, премиум характер.',
  },
  {
    id: '20',
    src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop',
    title: 'Linea 20',
    description: 'Плавная кинетика, чистая траектория.',
  },
];

// -----------------------------
// УТИЛИТЫ
// -----------------------------
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Прелоад изображений, чтобы не мигало при появлении
function useImagesPreload(urls: string[]) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    const tasks = urls.map(
      (src) =>
        new Promise<void>((res) => {
          const img = new Image();
          img.onload = () => res();
          img.onerror = () => res();
          img.src = src;
        })
    );
    Promise.all(tasks).then(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, [urls]);
  return ready;
}

// -----------------------------
// СТРАНИЦА
// -----------------------------
export default function Page() {
  // Подготовим пул >= 50 изображений за счёт повторений с новыми id (до замены на реальные 50+ в проде)
  const duplicated: ImageItem[] = useMemo(() => {
    const need = 50;
    const out: ImageItem[] = [];
    let c = 0;
    while (out.length < need) {
      for (const base of BASE_IMAGES) {
        if (out.length >= need) break;
        c += 1;
        out.push({ ...base, id: `${base.id}-${c}` });
      }
    }
    return out;
  }, []);

  const images = useMemo(() => shuffle(duplicated).slice(0, 50), [duplicated]);
  const ready = useImagesPreload(images.map((i) => i.src));

  const [elevatedId, setElevatedId] = useState<string | null>(null);
  const [sidebarId, setSidebarId] = useState<string | null>(null);
  const [sidebarSize, setSidebarSize] = useState<'third' | 'quarter'>('third'); // по умолчанию 1/3

  const openSidebar = useCallback((id: string) => {
    setSidebarId(id);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarId(null);
  }, []);

  // Esc закрывает сайдбар
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeSidebar();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeSidebar]);

  // Клик по карточке
  const onCardClick = (id: string) => {
    if (sidebarId) {
      // При открытом сайдбаре — обновляем его контент
      openSidebar(id);
      setElevatedId(null);
      return;
    }
    // При закрытом: 1-й клик — приподнять; 2-й клик — открыть сайдбар
    if (elevatedId === id) {
      openSidebar(id);
    } else {
      setElevatedId(id);
    }
  };

  // Для клавиатуры: Enter/Space дублирует клик, i открывает/обновляет сайдбар
  const onCardKey = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCardClick(id);
    }
    if (e.key.toLowerCase() === 'i') {
      e.preventDefault();
      openSidebar(id);
    }
  };

  if (!ready) return <GlobalLoading />; // Используем фирменный лоадер до полной загрузки фото

  const sidebarWidthClass = sidebarSize === 'third' ? 'lg:w-[33.33vw]' : 'lg:w-[25vw]';
  const gridShiftClass = sidebarId
    ? sidebarSize === 'third'
      ? 'lg:ml-[33.33vw]'
      : 'lg:ml-[25vw]'
    : 'ml-0';

  return (
    <div className="relative">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[var(--background)]/70 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/60">
        <div className="mx-auto max-w-[1600px] px-4 py-4">
          <h1 className="text-base font-medium tracking-[0.2em] uppercase text-white/80">
            H1NTED Gallery
          </h1>
        </div>
      </header>

      {/* SIDEBAR */}
      <Sidebar
        item={images.find((i) => i.id === sidebarId) || null}
        onClose={closeSidebar}
        size={sidebarSize}
        setSize={setSidebarSize}
      />

      {/* MOSAIC GRID */}
      <div className={['transition-[margin] duration-300', gridShiftClass].join(' ')}>
        <ul
          className={[
            'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
            'auto-rows-[10px] gap-0 select-none',
            'mx-auto max-w-[1600px] px-2 sm:px-4',
          ].join(' ')}
          aria-label="Pininfarina Gallery"
        >
          {images.map((item, idx) => (
            <MosaicTile
              key={item.id}
              item={item}
              elevated={elevatedId === item.id && sidebarId === null}
              onClick={() => onCardClick(item.id)}
              onOpenInfo={() => openSidebar(item.id)}
              onKey={(e) => onCardKey(e, item.id)}
              spanHint={randomSpan(idx)}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

// Размер плитки — ритм коллажа; grid-auto-rows=10px
function randomSpan(seed: number) {
  const r = (seed * 9301 + 49297) % 233280;
  const p = r / 233280;
  if (p < 0.55) return 18;
  if (p < 0.8) return 24;
  if (p < 0.95) return 32;
  return 48;
}

// -----------------------------
// ПЛИТКА
// -----------------------------
function MosaicTile({
  item,
  elevated,
  onClick,
  onOpenInfo,
  onKey,
  spanHint,
}: {
  item: ImageItem;
  elevated: boolean;
  onClick: () => void;
  onOpenInfo: () => void;
  onKey: (e: React.KeyboardEvent) => void;
  spanHint: number;
}) {
  const style = { gridRowEnd: `span ${spanHint}` } as React.CSSProperties;

  return (
    <li style={style} className="relative">
      <article
        tabIndex={0}
        aria-label={item.title}
        onClick={onClick}
        onKeyDown={onKey}
        className={[
          'group relative h-full w-full overflow-hidden',
          'outline-none',
          'transition-transform duration-200 ease-out will-change-transform',
          elevated ? 'z-10 scale-[1.03] -translate-y-[2px] shadow-2xl' : '',
        ].join(' ')}
      >
        <img
          src={item.src}
          alt={item.title}
          loading="lazy"
          className="block h-full w-full object-cover select-none"
          draggable={false}
        />

        {/* Hover accent line */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          aria-hidden
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent mix-blend-overlay" />
        </div>

        {/* Info button */}
        <button
          aria-label="Подробнее"
          onClick={(e) => {
            e.stopPropagation();
            onOpenInfo();
          }}
          className={[
            'absolute left-2 top-2 z-10 grid place-items-center',
            'h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm',
            'text-white/90 hover:text-white',
            'transition-colors',
          ].join(' ')}
        >
          <InfoIcon />
        </button>
      </article>
    </li>
  );
}

// -----------------------------
// САЙДБАР
// -----------------------------
function Sidebar({
  item,
  onClose,
  size,
  setSize,
}: {
  item: ImageItem | null;
  onClose: () => void;
  size: 'third' | 'quarter';
  setSize: (s: 'third' | 'quarter') => void;
}) {
  const open = Boolean(item);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Убираем автозакрытие по клику вне — сайдбар живёт пока X или Esc
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!panelRef.current) return;
      // намеренно ничего не делаем
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const widthClass = size === 'third' ? 'lg:w-[33.33vw]' : 'lg:w-[25vw]';

  return (
    <>
      {/* Затемнение на мобильном без закрытия по клику */}
      <div
        className={[
          'fixed inset-0 z-40 bg-black/30 lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
          'transition-opacity duration-200',
        ].join(' ')}
      />

      <aside
        ref={panelRef}
        className={[
          'fixed left-0 top-0 bottom-0 z-50 w-[85vw] max-w-[520px]',
          widthClass,
          'bg-neutral-950 text-neutral-100 border-r border-white/10',
          'px-6 py-6',
          'transition-transform duration-300 will-change-transform',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        aria-hidden={!open}
        aria-label="Информация о изображении"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-wide">{item?.title ?? ''}</h2>

          <div className="flex items-center gap-2">
            {/* Переключатель ширины */}
            <SizeSwitch size={size} setSize={setSize} />

            {/* Кнопка закрытия X */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="grid place-items-center h-8 w-8 rounded-xl bg-white/10 hover:bg-white/15"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-2xl overflow-hidden">
          {item && (
            <img
              src={item.src}
              alt={item.title}
              className="w-full h-48 object-cover"
              draggable={false}
            />
          )}
        </div>

        <p className="mt-5 text-sm leading-relaxed text-neutral-300">{item?.description ?? ''}</p>
      </aside>
    </>
  );
}

function SizeSwitch({
  size,
  setSize,
}: {
  size: 'third' | 'quarter';
  setSize: (s: 'third' | 'quarter') => void;
}) {
  const isThird = size === 'third';
  return (
    <div className="relative flex h-8 items-center rounded-xl bg-white/10 px-1">
      <button
        className={[
          'relative z-10 px-2 text-xs leading-none h-6 rounded-lg',
          isThird ? 'text-white' : 'text-white/70',
        ].join(' ')}
        onClick={() => setSize('third')}
        aria-pressed={isThird}
      >
        1/3
      </button>
      <button
        className={[
          'relative z-10 px-2 text-xs leading-none h-6 rounded-lg',
          !isThird ? 'text-white' : 'text-white/70',
        ].join(' ')}
        onClick={() => setSize('quarter')}
        aria-pressed={!isThird}
      >
        1/4
      </button>
      <span
        className={[
          'absolute top-1 bottom-1 w-[44px] rounded-lg bg-white/15 transition-transform',
          isThird ? 'translate-x-1' : 'translate-x-[50px]',
        ].join(' ')}
        aria-hidden
      />
    </div>
  );
}

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="8" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
