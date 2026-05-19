<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const DMYTRO_TZ = 'Europe/Podgorica';

const dmytroTime = ref('');
const visitorTime = ref('');
const diffLabel = ref('');
const mounted = ref(false);

function isWorkingHour(now: Date): boolean {
  const local = new Date(now.toLocaleString('en-US', { timeZone: DMYTRO_TZ }));
  const day = local.getDay();
  const hour = local.getHours();
  return day >= 1 && day <= 5 && hour >= 9 && hour < 18;
}

const isOnline = ref(isWorkingHour(new Date()));

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

function tick(): void {
  const now = new Date();
  dmytroTime.value = formatHHMM(now, DMYTRO_TZ);
  isOnline.value = isWorkingHour(now);

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

.time-display__row {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
}

.time-display__time {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  letter-spacing: 0.02em;
}

.time-display__sep {
  color: var(--color-subtle);
}

.time-display__location {
  font-size: 13px;
  color: var(--color-subtle);
}

.time-display__visitor {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 12px;
  color: var(--color-muted);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}

.time-display__status {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 13px;
  font-weight: 500;
}

.time-display__status--online  { color: var(--color-status-available); }
.time-display__status--offline { color: var(--color-muted); }

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

.time-display__diff {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-subtle);
}
</style>
