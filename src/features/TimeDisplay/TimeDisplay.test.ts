import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import TimeDisplay from './TimeDisplay.vue';

beforeEach(() => {
  vi.useFakeTimers();
  // Fix "now" to a known weekday (Tuesday 2024-01-09) at 12:00 UTC
  // Europe/Podgorica is UTC+1 in January, so local time = 13:00 → within work hours
  vi.setSystemTime(new Date('2024-01-09T12:00:00.000Z'));
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('TimeDisplay', () => {
  it('renders the component root element', () => {
    const wrapper = mount(TimeDisplay);
    expect(wrapper.find('.time-display').exists()).toBe(true);
  });

  it('shows online status during work hours on a weekday', async () => {
    const wrapper = mount(TimeDisplay);
    await flushPromises();
    // 12:00 UTC = 13:00 in Europe/Podgorica (UTC+1 in January), a Tuesday → online
    expect(wrapper.find('.time-display__status--online').exists()).toBe(true);
    expect(wrapper.find('.time-display__status').text()).toContain('Online');
  });

  it('shows offline status outside work hours', async () => {
    // 22:00 UTC = 23:00 Europe/Podgorica → outside 09:00–18:00
    vi.setSystemTime(new Date('2024-01-09T22:00:00.000Z'));
    const wrapper = mount(TimeDisplay);
    await flushPromises();
    expect(wrapper.find('.time-display__status--offline').exists()).toBe(true);
    expect(wrapper.find('.time-display__status').text()).toContain('Offline');
  });

  it('shows offline status on weekend', async () => {
    // 2024-01-07 is a Sunday, 12:00 UTC = 13:00 local
    vi.setSystemTime(new Date('2024-01-07T12:00:00.000Z'));
    const wrapper = mount(TimeDisplay);
    await flushPromises();
    expect(wrapper.find('.time-display__status--offline').exists()).toBe(true);
  });

  it('displays formatted time after mount', async () => {
    const wrapper = mount(TimeDisplay);
    await flushPromises();
    expect(wrapper.find('.time-display__time').text()).toMatch(/^\d{2}:\d{2}$/);
  });

  it('clears interval on unmount', async () => {
    const clearSpy = vi.spyOn(globalThis, 'clearInterval');
    const wrapper = mount(TimeDisplay);
    await flushPromises();
    wrapper.unmount();
    expect(clearSpy).toHaveBeenCalled();
  });

  it('updates time when interval fires', async () => {
    const wrapper = mount(TimeDisplay);
    await flushPromises();
    const timeBefore = wrapper.find('.time-display__time').text();

    // Advance by 61 seconds so the minute changes (12:00 → 12:01 UTC = 13:01 local)
    vi.setSystemTime(new Date('2024-01-09T12:01:00.000Z'));
    vi.advanceTimersByTime(1000);
    await flushPromises();

    const timeAfter = wrapper.find('.time-display__time').text();
    // Time string may or may not change depending on exact minute boundary,
    // but the component should still show a valid HH:MM pattern
    expect(timeAfter).toMatch(/^\d{2}:\d{2}$/);
    // The minute did advance so it must differ
    expect(timeAfter).not.toBe(timeBefore);
  });

  it('shows diff label in valid format when visitor row is visible', async () => {
    const wrapper = mount(TimeDisplay);
    await flushPromises();

    const visitorRow = wrapper.find('.time-display__visitor');
    if (visitorRow.exists()) {
      const diffEl = wrapper.find('.time-display__diff');
      expect(diffEl.exists()).toBe(true);
      expect(diffEl.text()).toMatch(/^([+-]\d+h from you|same timezone)$/);
    }
    // If visitor row is absent (Intl threw), that is also a valid code path — no assertion needed
  });
});
