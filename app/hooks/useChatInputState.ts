import { useState } from 'react';

export function useChatInputState() {
  const [inputValue, setInputValue] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [fileStatus, setFileStatus] = useState<string>(''); // UK English status for UI

  // ENV (client)
  const MAX_FILES = Number(process.env.NEXT_PUBLIC_IMG_MAX_COUNT ?? '3');
  const MAX_INLINE_MB = Number(process.env.NEXT_PUBLIC_IMG_MAX_INLINE_MB ?? '4');
  const MAX_BYTES = MAX_INLINE_MB * 1024 * 1024;
  const MAX_WIDTH = Number(process.env.NEXT_PUBLIC_IMG_MAX_WIDTH_BIG ?? '2000'); // starting width cap
  const JPEG_Q_BASE = Number(process.env.NEXT_PUBLIC_IMG_JPEG_QUALITY ?? '0.82');
  const MP_CAP = 12 * 1_000_000; // ≤ 12 MP for stability on mobiles

  const ALLOWED_TYPES = ['image/']; // images only

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
        newErrors.push(`You can attach up to ${MAX_FILES} images.`);
        break;
      }

      if (
        !ALLOWED_TYPES.some((type) => file.type.startsWith(type)) &&
        file.type !== 'image/heic' &&
        !file.name.toLowerCase().endsWith('.heic')
      ) {
        newErrors.push(`Unsupported file type: ${file.name}`);
        continue;
      }

      try {
        // visible, concise statuses (UK English) under the input
        setFileStatus('Optimising image before upload…');
        const slowTimer = setTimeout(() => {
          setFileStatus('Still optimising — almost there…');
        }, 2000);

        const optimised = await optimiseImageToInlineLimit(file, {
          maxBytes: MAX_BYTES,
          maxWidth: MAX_WIDTH,
          baseQuality: JPEG_Q_BASE,
          mpCap: MP_CAP,
          setStatus: (s) => setFileStatus(s),
        });

        clearTimeout(slowTimer);
        setFileStatus('');

        if (optimised.size > MAX_BYTES) {
          newErrors.push(`Image is too large even after optimisation: ${file.name}`);
          continue;
        }

        newFiles.push(optimised);
      } catch (e) {
        console.error('Optimisation failed:', file.name, e);
        setFileStatus('');
        newErrors.push(`Failed to prepare image: ${file.name}`);
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
    setFileStatus('');
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
    fileStatus, // show this string under the input
  };
}

/* =========================
   Optimisation pipeline
   ========================= */

type OptimiseOpts = {
  maxBytes: number;
  maxWidth: number;
  mpCap: number; // maximum pixels (e.g., 12 MP)
  baseQuality: number; // starting JPEG quality
  setStatus?: (s: string) => void;
};

/**
 * Converts any incoming image (incl. HEIC) to correctly oriented JPEG
 * and iteratively shrinks width/quality until <= maxBytes.
 */
async function optimiseImageToInlineLimit(file: File, opts: OptimiseOpts): Promise<File> {
  const { maxBytes, maxWidth, baseQuality, mpCap } = opts;

  // HEIC → PNG first, then we will encode to JPEG
  let working: Blob = file;
  if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
    const heic2any = (await import('heic2any')).default;
    const res = await heic2any({ blob: file, toType: 'image/png' });
    working = Array.isArray(res) ? res[0] : (res as Blob);
  }

  // Draw with EXIF-aware orientation and megapixel cap
  let canvas = await drawToCanvasWithOrientation(working, maxWidth, mpCap);
  let quality = clamp(baseQuality, 0.7, 0.95);

  // Quick attempt: base quality at target width
  let dataUrl = canvas.toDataURL('image/jpeg', quality);
  let approxBytes = approxBytesFromDataUrl(dataUrl);
  if (approxBytes <= maxBytes) {
    return dataUrlToFile(dataUrl, renameToJpeg(file.name || 'image'));
  }

  // Iterative tightening: first width ↓ (from original blob), then quality ↓
  let width = canvas.width;
  const minWidth = 640;
  const minQuality = 0.7;
  const stepW = 0.85;
  const stepQ = 0.05;

  const started = Date.now();
  while (approxBytes > maxBytes && (width > minWidth || quality > minQuality)) {
    if (width > minWidth) {
      width = Math.max(minWidth, Math.round(width * stepW));
      // Re-draw from original working blob to avoid compounding losses
      canvas = await drawToCanvasWithOrientation(working, width, mpCap);
    } else {
      quality = Math.max(minQuality, +(quality - stepQ).toFixed(2));
    }
    dataUrl = canvas.toDataURL('image/jpeg', quality);
    approxBytes = approxBytesFromDataUrl(dataUrl);

    // Safety: avoid long loops on weak mobiles
    if (Date.now() - started > 5000) break;
  }

  return dataUrlToFile(dataUrl, renameToJpeg(file.name || 'image'));
}

/* =========================
   Canvas + EXIF helpers
   ========================= */

async function drawToCanvasWithOrientation(
  blob: Blob,
  maxWidth: number,
  mpCap: number
): Promise<HTMLCanvasElement> {
  // Fast path: let browser honour EXIF Orientation
  try {
    // @ts-ignore: supported in modern browsers
    const bmp: ImageBitmap = await createImageBitmap(blob, { imageOrientation: 'from-image' });
    const { w, h } = fitWithCap(bmp.width, bmp.height, maxWidth, mpCap);
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    c.getContext('2d')!.drawImage(bmp, 0, 0, w, h);
    bmp.close?.();
    return c;
  } catch {
    // Fallback below
  }

  // Fallback: <img> + minimal EXIF-Orientation for JPEGs
  const url = URL.createObjectURL(blob);
  try {
    const [img, orientation] = await Promise.all([loadImage(url), readJpegOrientation(blob)]);
    const { w, h } = fitWithCap(img.width, img.height, maxWidth, mpCap);
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d')!;
    const t = orientationToTransform(orientation);

    if (t.swap) {
      c.width = h;
      c.height = w;
    } else {
      c.width = w;
      c.height = h;
    }

    ctx.save();
    applyCanvasTransform(ctx, t, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    ctx.restore();
    return c;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function fitWithCap(w: number, h: number, maxW: number, mpCap: number) {
  const ratioW = Math.min(1, maxW / w);
  let W = Math.max(1, Math.round(w * ratioW));
  let H = Math.max(1, Math.round(h * ratioW));

  // megapixel cap
  const mp = W * H;
  if (mp > mpCap) {
    const r = Math.sqrt(mpCap / mp);
    W = Math.max(1, Math.round(W * r));
    H = Math.max(1, Math.round(H * r));
  }
  return { w: W, h: H };
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => reject(new Error('Image load failed'));
    im.src = url;
  });
}

async function readJpegOrientation(blob: Blob): Promise<number | null> {
  try {
    const ab = await blob.slice(0, 128 * 1024).arrayBuffer();
    const dv = new DataView(ab);
    if (dv.getUint16(0) !== 0xffd8) return null; // not JPEG

    let off = 2;
    while (off + 4 < dv.byteLength) {
      const marker = dv.getUint16(off);
      off += 2;
      const size = dv.getUint16(off);
      off += 2;

      if (marker === 0xffe1 && size >= 10) {
        // "Exif\0\0"
        if (dv.getUint32(off) === 0x45786966 && dv.getUint16(off + 4) === 0) {
          const tiff = off + 6;
          const little = dv.getUint16(tiff) === 0x4949;
          const get16 = (p: number) => (little ? dv.getUint16(p, true) : dv.getUint16(p, false));
          const get32 = (p: number) => (little ? dv.getUint32(p, true) : dv.getUint32(p, false));

          const ifd0 = tiff + get32(tiff + 4);
          const count = get16(ifd0);

          for (let i = 0; i < count; i++) {
            const p = ifd0 + 2 + i * 12;
            const tag = get16(p);
            if (tag === 0x0112) {
              return get16(p + 8);
            }
          }
        }
        break;
      } else {
        off += size - 2;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function orientationToTransform(o: number | null) {
  switch (o) {
    case 2:
      return { rotate: 0, flipH: true, swap: false };
    case 3:
      return { rotate: 180, flipH: false, swap: false };
    case 4:
      return { rotate: 180, flipH: true, swap: false };
    case 5:
      return { rotate: 90, flipH: true, swap: true };
    case 6:
      return { rotate: 90, flipH: false, swap: true };
    case 7:
      return { rotate: 270, flipH: true, swap: true };
    case 8:
      return { rotate: 270, flipH: false, swap: true };
    default:
      return { rotate: 0, flipH: false, swap: false };
  }
}
function applyCanvasTransform(
  ctx: CanvasRenderingContext2D,
  t: { rotate: number; flipH: boolean; swap: boolean },
  w: number,
  h: number
) {
  const rad = (t.rotate * Math.PI) / 180;
  if (t.swap) {
    if (t.rotate === 90) ctx.translate(h, 0);
    if (t.rotate === 270) ctx.translate(0, w);
    ctx.rotate(rad);
  } else {
    if (t.rotate === 180) ctx.translate(w, h);
    ctx.rotate(rad);
  }
  if (t.flipH) {
    ctx.translate(t.swap ? h : w, 0);
    ctx.scale(-1, 1);
  }
}

/* =========================
   Small utilities
   ========================= */

function approxBytesFromDataUrlPayloadLen(len: number) {
  // base64 is ~4/3 of bytes => bytes ≈ len * 0.75
  return Math.floor(len * 0.75);
}
function approxBytesFromDataUrl(u: string) {
  const b64 = u.split(',')[1] || '';
  return approxBytesFromDataUrlPayloadLen(b64.length);
}
function dataUrlToFile(u: string, name: string) {
  const b64 = u.split(',')[1] || '';
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return new File([buf], name, { type: 'image/jpeg' });
}
function renameToJpeg(n: string) {
  return n.replace(/\.(heic|webp|png|jpeg|jpg)$/i, '') + '.jpg';
}
function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * Legacy helper (kept for compatibility).
 * Basic resize without EXIF; prefer the new pipeline above.
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
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(width));
      canvas.height = Math.max(1, Math.round(height));

      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Failed to get canvas context'));

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (out) => {
          if (!out) return reject(new Error('Failed to create blob'));
          resolve(out);
        },
        mimeType,
        quality
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}
