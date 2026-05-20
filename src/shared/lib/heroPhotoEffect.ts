const CANVAS_SIZE = 120;
const BURST_FRAMES = 6;
const BURST_INTERVAL_MS = 50;
const HOVER_INTERVAL_MS = 80;
const SCHEDULE_MIN_MS = 1000;
const SCHEDULE_RANGE_MS = 4000;
const NUM_BANDS_MIN = 2;
const NUM_BANDS_MAX = 4;
const BAND_HEIGHT_MIN = 4;
const BAND_HEIGHT_MAX = 20;
const BAND_NOISE_CHANCE = 0.35;
const BAND_SHIFT_MIN = 8;
const BAND_SHIFT_MAX = 20;
const MICRO_JITTER_CHANCE = 0.05;
const MICRO_JITTER_RANGE = 6;
const NOISE_ALPHA_MIN = 0.12;
const NOISE_ALPHA_RANGE = 0.22;

interface Band {
  start: number;
  end: number;
  isNoise: boolean;
}

function makeOffscreen(img: HTMLImageElement, filter: string): HTMLCanvasElement | null {
  const c = document.createElement('canvas');
  c.width = CANVAS_SIZE;
  c.height = CANVAS_SIZE;
  const cx = c.getContext('2d');
  if (!cx) return null;
  cx.filter = filter;
  cx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
  return c;
}

function makeDisplacements(): { d: Int16Array; bands: Band[] } {
  const raw = new Float32Array(CANVAS_SIZE);
  const bands: Band[] = [];

  const numBands = NUM_BANDS_MIN + Math.floor(Math.random() * (NUM_BANDS_MAX - NUM_BANDS_MIN + 1));
  for (let b = 0; b < numBands; b++) {
    const start = Math.floor(Math.random() * (CANVAS_SIZE - BAND_HEIGHT_MAX));
    const h = BAND_HEIGHT_MIN + Math.floor(Math.random() * (BAND_HEIGHT_MAX - BAND_HEIGHT_MIN));
    const end = Math.min(start + h, CANVAS_SIZE);
    const sign = Math.random() < 0.5 ? 1 : -1;
    const dx = sign * (BAND_SHIFT_MIN + Math.random() * BAND_SHIFT_MAX);
    bands.push({ start, end, isNoise: Math.random() < BAND_NOISE_CHANCE });
    for (let y = start; y < end; y++) raw[y] = dx;
  }

  for (let y = 0; y < CANVAS_SIZE; y++) {
    if (raw[y]! === 0 && Math.random() < MICRO_JITTER_CHANCE)
      raw[y] = (Math.random() - 0.5) * MICRO_JITTER_RANGE;
  }

  let sum = 0;
  for (let y = 0; y < CANVAS_SIZE; y++) sum += raw[y]!;
  const mean = sum / CANVAS_SIZE;
  const d = new Int16Array(CANVAS_SIZE);
  for (let y = 0; y < CANVAS_SIZE; y++) d[y] = Math.round(raw[y]! - mean);

  return { d, bands };
}

export function initHeroPhotoEffect(
  wrap: HTMLElement,
  imgEl: HTMLImageElement,
): () => void {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  Object.assign(canvas.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    width: `${CANVAS_SIZE}px`,
    height: `${CANVAS_SIZE}px`,
    pointerEvents: 'none',
    opacity: '0',
  });
  wrap.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return () => {};
  }
  const renderCtx: CanvasRenderingContext2D = ctx;

  let destroyed = false;
  let gc: HTMLCanvasElement | null = null;
  let cc: HTMLCanvasElement | null = null;

  function setupOffscreen(): boolean {
    if (gc && cc) return true;
    gc = makeOffscreen(imgEl, 'grayscale(1) contrast(1.05)');
    cc = makeOffscreen(imgEl, 'contrast(1.05)');
    return !!(gc && cc);
  }

  function drawFrame(colored: boolean): void {
    if (!setupOffscreen()) return;
    const src = colored ? cc! : gc!;
    const { d, bands } = makeDisplacements();
    const bg =
      getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim() || '#0c0c0a';

    renderCtx.filter = 'none';
    renderCtx.fillStyle = bg;
    renderCtx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    for (let y = 0; y < CANVAS_SIZE; y++) {
      renderCtx.drawImage(src, 0, y, CANVAS_SIZE, 1, d[y]!, y, CANVAS_SIZE, 1);
    }

    for (const band of bands) {
      if (band.isNoise) {
        renderCtx.fillStyle = `rgba(255,255,255,${NOISE_ALPHA_MIN + Math.random() * NOISE_ALPHA_RANGE})`;
        renderCtx.fillRect(0, band.start, CANVAS_SIZE, band.end - band.start);
      }
    }
  }

  let hovered = false;
  let hoverTimerId: ReturnType<typeof setInterval> | null = null;
  let burstIntervalId: ReturnType<typeof setInterval> | null = null;
  let scheduleTimeoutId: ReturnType<typeof setTimeout> | null = null;

  function runBurst(): void {
    if (destroyed) return;
    let i = 0;
    canvas.style.opacity = '1';
    imgEl.style.opacity = '0';
    drawFrame(false);
    burstIntervalId = setInterval(() => {
      if (destroyed) {
        clearInterval(burstIntervalId!);
        burstIntervalId = null;
        return;
      }
      drawFrame(false);
      if (++i >= BURST_FRAMES) {
        if (burstIntervalId !== null) {
          clearInterval(burstIntervalId);
          burstIntervalId = null;
        }
        if (!hovered) {
          canvas.style.opacity = '0';
          imgEl.style.opacity = '1';
        }
      }
    }, BURST_INTERVAL_MS);
  }

  function scheduleNext(): void {
    if (destroyed) return;
    scheduleTimeoutId = setTimeout(
      () => {
        if (!hovered) runBurst();
        scheduleNext();
      },
      SCHEDULE_MIN_MS + Math.random() * SCHEDULE_RANGE_MS,
    );
  }

  function onEnter(): void {
    if (destroyed) return;
    hovered = true;
    canvas.style.opacity = '1';
    imgEl.style.opacity = '0';
    drawFrame(true);
    hoverTimerId = setInterval(() => {
      if (destroyed) {
        clearInterval(hoverTimerId!);
        hoverTimerId = null;
        return;
      }
      drawFrame(true);
    }, HOVER_INTERVAL_MS);
  }

  function onLeave(): void {
    hovered = false;
    if (hoverTimerId !== null) {
      clearInterval(hoverTimerId);
      hoverTimerId = null;
    }
    canvas.style.opacity = '0';
    imgEl.style.opacity = '1';
  }

  wrap.addEventListener('mouseenter', onEnter);
  wrap.addEventListener('mouseleave', onLeave);

  if (imgEl.complete && imgEl.naturalWidth > 0) {
    scheduleNext();
  } else {
    imgEl.addEventListener('load', scheduleNext, { once: true });
  }

  return () => {
    destroyed = true;
    if (hoverTimerId !== null) { clearInterval(hoverTimerId); hoverTimerId = null; }
    if (burstIntervalId !== null) { clearInterval(burstIntervalId); burstIntervalId = null; }
    if (scheduleTimeoutId !== null) { clearTimeout(scheduleTimeoutId); scheduleTimeoutId = null; }
    wrap.removeEventListener('mouseenter', onEnter);
    wrap.removeEventListener('mouseleave', onLeave);
    canvas.remove();
    imgEl.style.opacity = '1';
  };
}
