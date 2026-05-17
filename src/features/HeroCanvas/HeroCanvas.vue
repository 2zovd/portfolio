<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Colors {
  particle: string;
  line: string;
}

const PARTICLE_COUNT = 80;
const CONNECTION_DISTANCE = 120;
const PARTICLE_RADIUS = 1.5;
const BASE_SPEED = 0.3;
const MOUSE_REPEL_RADIUS = 100;
const MOUSE_REPEL_STRENGTH = 0.5;

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let particles: Particle[] = [];
let colors: Colors = { particle: '', line: '' };
let w = 0;
let h = 0;
let rafId = 0;
const mouse = { x: -9999, y: -9999 };

function readColors(): void {
  const style = getComputedStyle(document.documentElement);
  colors = {
    particle: style.getPropertyValue('--canvas-particle').trim(),
    line: style.getPropertyValue('--canvas-line').trim(),
  };
}

function initParticles(): void {
  particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * BASE_SPEED * 2,
    vy: (Math.random() - 0.5) * BASE_SPEED * 2,
  }));
}

function resize(): void {
  if (!canvas) return;
  const section = canvas.closest<HTMLElement>('section');
  if (!section) return;
  w = section.offsetWidth;
  h = section.offsetHeight;
  canvas.width = w;
  canvas.height = h;
  initParticles();
}

function update(): void {
  for (const p of particles) {
    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const dist = Math.hypot(dx, dy);

    if (dist < MOUSE_REPEL_RADIUS && dist > 0) {
      const force = ((MOUSE_REPEL_RADIUS - dist) / MOUSE_REPEL_RADIUS) * MOUSE_REPEL_STRENGTH;
      p.vx += (dx / dist) * force;
      p.vy += (dy / dist) * force;
    }

    p.vx *= 0.98;
    p.vy *= 0.98;

    const speed = Math.hypot(p.vx, p.vy);
    if (speed > BASE_SPEED) {
      p.vx = (p.vx / speed) * BASE_SPEED;
      p.vy = (p.vy / speed) * BASE_SPEED;
    }

    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0) {
      p.x = 0;
      p.vx = Math.abs(p.vx);
    } else if (p.x > w) {
      p.x = w;
      p.vx = -Math.abs(p.vx);
    }
    if (p.y < 0) {
      p.y = 0;
      p.vy = Math.abs(p.vy);
    } else if (p.y > h) {
      p.y = h;
      p.vy = -Math.abs(p.vy);
    }
  }
}

function draw(): void {
  if (!ctx) return;
  ctx.clearRect(0, 0, w, h);

  for (let i = 0; i < particles.length; i++) {
    const a = particles[i]!;
    for (let j = i + 1; j < particles.length; j++) {
      const b = particles[j]!;
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist < CONNECTION_DISTANCE) {
        ctx.globalAlpha = (1 - dist / CONNECTION_DISTANCE) * 0.5;
        ctx.strokeStyle = colors.line;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  ctx.globalAlpha = 1;
  ctx.fillStyle = colors.particle;
  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, PARTICLE_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }
}

function loop(): void {
  update();
  draw();
  rafId = requestAnimationFrame(loop);
}

onMounted(() => {
  canvas = document.querySelector<HTMLCanvasElement>('.hero-canvas');
  if (!canvas) return;

  ctx = canvas.getContext('2d');
  if (!ctx) return;

  readColors();
  resize();
  loop();

  const onMouseMove = (e: MouseEvent): void => {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  };

  const onMouseLeave = (): void => {
    mouse.x = -9999;
    mouse.y = -9999;
  };

  const resizeObserver = new ResizeObserver(resize);
  const section = canvas.closest('section');
  if (section) resizeObserver.observe(section);

  const mutationObserver = new MutationObserver(readColors);
  mutationObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseleave', onMouseLeave);

  onUnmounted(() => {
    cancelAnimationFrame(rafId);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseleave', onMouseLeave);
    resizeObserver.disconnect();
    mutationObserver.disconnect();
  });
});
</script>

<template>
  <canvas
    class="hero-canvas"
    aria-hidden="true"
  />
</template>

<style scoped>
.hero-canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  width: 100%;
  height: 100%;

  @media (prefers-reduced-motion: reduce) {
    display: none;
  }
}
</style>
