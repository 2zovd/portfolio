<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { SITE } from '@shared/config/site';

const DMYTRO_TZ = SITE.workHours.timezone;
const { start, end, days } = SITE.workHours;
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

const dmytroTime = ref('');
const visitorTime = ref('');
const diffLabel = ref('');
const mounted = ref(false);
const isOnline = ref(false);
const progressPercent = ref(0);
const workSuffix = ref('');

let timer: ReturnType<typeof setInterval> | undefined;

function formatHHMM(date: Date, tz: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: tz,
    hour12: false,
  }).format(date);
}

function getOffsetHours(date: Date, tz: string): number {
  const utcMs = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' })).getTime();
  const tzMs = new Date(date.toLocaleString('en-US', { timeZone: tz })).getTime();
  return Math.round((tzMs - utcMs) / 3_600_000);
}

function computeWorkHours(now: Date): void {
  const local = new Date(now.toLocaleString('en-US', { timeZone: DMYTRO_TZ }));
  const day = local.getDay();
  const h = local.getHours();
  const m = local.getMinutes();
  const nowMin = h * 60 + m;
  const startMin = start * 60;
  const endMin = end * 60;
  const online = day >= days[0] && day <= days[1] && nowMin >= startMin && nowMin < endMin;

  isOnline.value = online;

  if (online) {
    progressPercent.value = Math.round(((nowMin - startMin) / (endMin - startMin)) * 100);
    const remMin = endMin - nowMin;
    const rh = Math.floor(remMin / 60);
    const rm = remMin % 60;
    workSuffix.value = rh > 0 ? `· ${rh}h ${rm}m left` : `· ${rm}m left`;
  } else {
    progressPercent.value = 0;
    const nextDay = day < days[0] || day > days[1] ? DAY_NAMES[days[0]] : DAY_NAMES[(day % 7) + 1];
    workSuffix.value = `· back ${nextDay} ${String(start).padStart(2, '0')}:00`;
  }
}

function tick(): void {
  const now = new Date();
  dmytroTime.value = formatHHMM(now, DMYTRO_TZ);
  computeWorkHours(now);

  try {
    const visitorTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    visitorTime.value = formatHHMM(now, visitorTz);

    const dmytroOff = getOffsetHours(now, DMYTRO_TZ);
    const visitorOff = getOffsetHours(now, visitorTz);
    const diff = dmytroOff - visitorOff;

    if (diff === 0) {
      diffLabel.value = 'same timezone';
    } else {
      const sign = diff > 0 ? '+' : '';
      diffLabel.value = `${sign}${diff}h from you`;
    }
  } catch {
    visitorTime.value = '';
    diffLabel.value = '';
  }
}

onMounted(() => {
  mounted.value = true;
  tick();
  timer = setInterval(tick, 1000);
});

onUnmounted(() => {
  if (timer !== undefined) clearInterval(timer);
});
</script>

<template>
  <div
    class="time-display"
    aria-live="off"
    aria-atomic="true"
  >
    <span
      class="time-display__status"
      :class="isOnline ? 'time-display__status--online' : 'time-display__status--offline'"
    >
      <span
        class="time-display__dot"
        :class="isOnline ? 'time-display__dot--online' : 'time-display__dot--offline'"
        aria-hidden="true"
      />
      <span>{{ isOnline ? 'Online' : 'Offline' }}</span>
      <span
        v-if="mounted"
        class="time-display__suffix"
      >{{ workSuffix }}</span>
    </span>
    <span
      class="time-display__progress"
      role="presentation"
      aria-hidden="true"
    >
      <span
        class="time-display__progress-fill"
        :style="{ width: progressPercent + '%' }"
      />
    </span>
    <span class="time-display__row">
      <span class="time-display__time">{{ mounted ? dmytroTime : '&ndash;&ndash;:&ndash;&ndash;' }}</span>
      <span
        class="time-display__sep"
        aria-hidden="true"
      >·</span>
      <span class="time-display__location">CET</span>
    </span>
    <span
      v-if="mounted && visitorTime && diffLabel"
      class="time-display__visitor"
    >
      Your time: {{ visitorTime }}
      <span class="time-display__diff">{{ diffLabel }}</span>
    </span>
  </div>
</template>

<style scoped>
.time-display {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.time-display__status {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-md);
  font-weight: 500;
}

.time-display__status--online  { color: var(--color-status-available); }
.time-display__status--offline { color: var(--color-muted); }

.time-display__suffix {
  font-size: var(--font-size-sm);
  font-weight: 400;
  opacity: 0.7;
}

.time-display__progress {
  display: block;
  height: 2px;
  background-color: var(--color-border);
  margin-block: 2px;
}

.time-display__progress-fill {
  display: block;
  height: 100%;
  background-color: var(--color-accent);
  transition: width var(--transition-slow) var(--ease-out-expo);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}

.time-display__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.time-display__dot--online {
  background-color: var(--color-status-available);
  animation: pulse 2s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
}

.time-display__dot--offline {
  background-color: var(--color-muted);
}

.time-display__row {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
}

.time-display__time {
  font-family: var(--font-mono);
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--color-text);
  letter-spacing: 0.02em;
}

.time-display__sep {
  color: var(--color-subtle);
}

.time-display__location {
  font-size: var(--font-size-md);
  color: var(--color-subtle);
}

.time-display__visitor {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-muted);
}

.time-display__diff {
  font-size: var(--font-size-2xs);
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-subtle);
}
</style>
