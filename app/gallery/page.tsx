'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import GlobalLoading from '@/app/loading';

// =============================
// Pininfarina Masonry Gallery — Desktop-first
// =============================

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

// ---------- утилиты ----------
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Предзагрузка с ограничением конкуренции и ретраями — БЕЗ возврата промиса из useEffect */
function useImagesPreload(urls: string[], opts: { concurrency?: number; retries?: number } = {}) {
  const { concurrency = 6, retries = 2 } = opts;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;

    const loadOne = (src: string, attempt = 0): Promise<void> =>
      new Promise((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.crossOrigin = 'anonymous';
        img.referrerPolicy = 'no-referrer';
        img.onload = () => resolve();
        img.onerror = () => {
          if (attempt < retries) {
            const backoff = 200 * (attempt + 1);
            setTimeout(() => {
              if (!alive) return resolve();
              loadOne(src, attempt + 1).then(resolve);
            }, backoff);
          } else {
            resolve(); // не блокируем весь процесс из-за одного файла
          }
        };
        img.src = src;
      });

    const queue = [...urls];
    let done = 0;

    async function runNext() {
      if (!alive) return;
      const src = queue.shift();
      if (!src) return;
      await loadOne(src);
      if (!alive) return;
      done++;
      if (done === urls.length) {
        setReady(true);
      } else if (queue.length) {
        // запускаем следующий
        runNext();
      }
    }

    // стартуем заданное число «воркеров»
    const starters = Math.min(concurrency, queue.length);
    for (let i = 0; i < starters; i++) runNext();

    // ВОЗВРАЩАЕМ ТОЛЬКО CLEANUP
    return () => {
      alive = false;
    };
  }, [urls, concurrency, retries]);

  return ready;
}

// ---------- аспекты карточек ----------
type Aspect = '1/1' | '4/3' | '3/4' | '16/9';
const ASPECTS_POOL: Aspect[] = ['4/3', '4/3', '16/9', '1/1', '3/4'];

const ASPECT_CLASS: Record<Aspect, string> = {
  '1/1': 'aspect-[1/1]',
  '4/3': 'aspect-[4/3]',
  '3/4': 'aspect-[3/4]',
  '16/9': 'aspect-[16/9]',
};

function randomAspect(): Aspect {
  const u8 = new Uint8Array(1);
  crypto.getRandomValues(u8);
  return ASPECTS_POOL[u8[0] % ASPECTS_POOL.length];
}

// =============================
// СТРАНИЦА
// =============================
export default function Page() {
  // Пул >=50
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
  const aspects = useMemo(() => images.map(() => randomAspect()), [images]);
  const ready = useImagesPreload(
    images.map((i) => i.src),
    { concurrency: 6, retries: 2 }
  );

  const [elevatedId, setElevatedId] = useState<string | null>(null);
  const [sidebarId, setSidebarId] = useState<string | null>(null);

  const openSidebar = useCallback((id: string) => setSidebarId(id), []);
  const closeSidebar = useCallback(() => setSidebarId(null), []);

  // Esc → закрыть
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSidebar();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeSidebar]);

  // Клик по карточке
  const onCardClick = (id: string) => {
    if (sidebarId) {
      openSidebar(id);
      setElevatedId(null);
      return;
    }
    if (elevatedId === id) openSidebar(id);
    else setElevatedId(id);
  };

  // Клавиатура
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

  if (!ready) return <GlobalLoading />;

  // Сайдбар всегда 1/3
  const sidebarWidthClass = 'lg:w-[33.33vw]';
  const gridShiftClass = sidebarId ? 'lg:ml-[33.33vw]' : 'ml-0';

  return (
    <div className="relative">
      {/* Header: слева ↔ справа при открытом сайдбаре */}
      <header className="sticky top-0 z-30 bg-[var(--background)]/70 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/60">
        <div
          className={[
            'mx-auto max-w-[1600px] px-4 py-4 transition-all duration-300 flex',
            sidebarId ? 'justify-end' : 'justify-start',
          ].join(' ')}
        >
          <h1 className="text-base font-medium tracking-[0.2em] uppercase text-white/80">
            H1NTED Gallery
          </h1>
        </div>
      </header>

      {/* SIDEBAR */}
      <Sidebar
        item={images.find((i) => i.id === sidebarId) || null}
        onClose={closeSidebar}
        widthClass={sidebarWidthClass}
      />

      {/* MASONRY (без пустот) */}
      <div className={['transition-[margin] duration-300', gridShiftClass].join(' ')}>
        <div
          className={[
            'columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5',
            'gap-x-3',
            'mx-auto max-w-[1600px] px-2 sm:px-4',
          ].join(' ')}
          aria-label="Pininfarina Gallery"
        >
          {images.map((item, idx) => (
            <div key={item.id} className="mb-3 break-inside-avoid">
              <MosaicTile
                item={item}
                elevated={elevatedId === item.id && sidebarId === null}
                onClick={() => onCardClick(item.id)}
                onOpenInfo={() => openSidebar(item.id)}
                onKey={(e) => onCardKey(e, item.id)}
                aspectClass={ASPECT_CLASS[aspects[idx]]}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================
// ПЛИТКА с устойчивой загрузкой
// =============================
function MosaicTile({
  item,
  elevated,
  onClick,
  onOpenInfo,
  onKey,
  aspectClass,
}: {
  item: ImageItem;
  elevated: boolean;
  onClick: () => void;
  onOpenInfo: () => void;
  onKey: (e: React.KeyboardEvent) => void;
  aspectClass: string;
}) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [reloadKey, setReloadKey] = useState(0);
  const attempts = useRef(0);

  useEffect(() => {
    setStatus('loading');
    attempts.current = 0;
    setReloadKey(0);
  }, [item.src]);

  const handleError = () => {
    if (attempts.current < 2) {
      attempts.current += 1;
      // небольшой бэкофф и принудительный ре-маунт <img>
      setTimeout(() => setReloadKey((k) => k + 1), 200 * attempts.current);
    } else {
      setStatus('error');
    }
  };

  return (
    <article
      tabIndex={0}
      aria-label={item.title}
      onClick={onClick}
      onKeyDown={onKey}
      className={[
        'group relative w-full overflow-hidden rounded-[16px]',
        'shadow-[0_8px_24px_rgba(0,0,0,.08)]',
        'ring-1 ring-inset ring-white/5',
        'transition-transform duration-200 ease-[cubic-bezier(.2,.8,.2,1)] will-change-transform',
        elevated ? 'z-10 scale-[1.02] -translate-y-[2px]' : '',
      ].join(' ')}
    >
      <div className={['relative', aspectClass].join(' ')}>
        {/* Скелетон вместо «чёрной пустоты» */}
        <div
          className={[
            'absolute inset-0',
            'bg-[radial-gradient(100%_60%_at_30%_20%,rgba(255,255,255,.06),rgba(255,255,255,.02)_45%,transparent_80%)]',
            'animate-pulse',
            status === 'ok' ? 'opacity-0' : 'opacity-100',
            'transition-opacity duration-200',
          ].join(' ')}
        />

        {status !== 'error' ? (
          <img
            key={reloadKey}
            src={item.src}
            alt={item.title}
            loading="lazy"
            decoding="async"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover select-none"
            draggable={false}
            onLoad={() => setStatus('ok')}
            onError={handleError}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70">
              Изображение недоступно
            </span>
          </div>
        )}

        {/* Показываем UI только когда картинка реально загрузилась */}
        {status === 'ok' && (
          <>
            {/* Hover-маска */}
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/45" />
            </div>

            {/* Info puck — Pininfarina */}
            <button
              aria-label="Подробнее"
              onClick={(e) => {
                e.stopPropagation();
                onOpenInfo();
              }}
              className={[
                'absolute left-3 top-3 z-10 grid place-items-center',
                'h-7 w-7 rounded-full',
                'bg-gradient-to-b from-white/14 to-white/6',
                'backdrop-blur-md ring-1 ring-white/20',
                'shadow-[0_2px_8px_rgba(0,0,0,.25)]',
                'text-white/90',
                'transition-all duration-150 hover:scale-[1.03] active:scale-[0.98]',
              ].join(' ')}
            >
              <InfoIcon />
            </button>

            {/* Caption */}
            <div className="absolute inset-x-0 bottom-0 px-3 pb-2">
              <p className="truncate text-[13px] font-medium text-white drop-shadow">
                {item.title}
              </p>
            </div>
          </>
        )}
      </div>
    </article>
  );
}

// =============================
// САЙДБАР (1/3 ширины, без переключателя)
// =============================
function Sidebar({
  item,
  onClose,
  widthClass,
}: {
  item: ImageItem | null;
  onClose: () => void;
  widthClass: string;
}) {
  const open = Boolean(item);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (_e: MouseEvent) => {};
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <>
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
          widthClass, // lg:w-[33.33vw]
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
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid place-items-center h-8 w-8 rounded-xl bg-white/10 hover:bg-white/15"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="mt-5 rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,.2)] ring-1 ring-inset ring-white/5">
          {item && (
            <img
              src={item.src}
              alt={item.title}
              className="w-full h-48 object-cover"
              draggable={false}
              decoding="async"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
            />
          )}
        </div>

        <p className="mt-5 text-sm leading-relaxed text-neutral-300">{item?.description ?? ''}</p>
      </aside>
    </>
  );
}

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
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
