import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ReadingProgress from './ReadingProgress.vue';

function setScrollEnv(scrollY: number, scrollHeight: number, innerHeight: number) {
  vi.stubGlobal('scrollY', scrollY);
  Object.defineProperty(document.body, 'scrollHeight', { value: scrollHeight, configurable: true });
  vi.stubGlobal('innerHeight', innerHeight);
}

beforeEach(() => {
  setScrollEnv(0, 1000, 500);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ReadingProgress', () => {
  it('renders a progressbar element', () => {
    const wrapper = mount(ReadingProgress);
    expect(wrapper.find('[role="progressbar"]').exists()).toBe(true);
  });

  it('bar width is 0% at scroll position 0', async () => {
    const wrapper = mount(ReadingProgress);
    await flushPromises();
    expect(wrapper.find('.reading-progress__bar').attributes('style')).toContain('width: 0%');
  });

  it('bar width is 100% when scrolled to bottom', async () => {
    // scrollHeight=1000, innerHeight=500 → scrollable=500; scrollY=500 → 100%
    setScrollEnv(500, 1000, 500);
    const wrapper = mount(ReadingProgress);
    await flushPromises();
    window.dispatchEvent(new Event('scroll'));
    await flushPromises();
    expect(wrapper.find('.reading-progress__bar').attributes('style')).toContain('width: 100%');
  });

  it('bar width is 50% at mid-page', async () => {
    setScrollEnv(250, 1000, 500);
    const wrapper = mount(ReadingProgress);
    await flushPromises();
    window.dispatchEvent(new Event('scroll'));
    await flushPromises();
    expect(wrapper.find('.reading-progress__bar').attributes('style')).toContain('width: 50%');
  });

  it('bar width stays 0% when page is not scrollable', async () => {
    // scrollHeight === innerHeight → scrollable = 0
    setScrollEnv(0, 500, 500);
    const wrapper = mount(ReadingProgress);
    await flushPromises();
    window.dispatchEvent(new Event('scroll'));
    await flushPromises();
    expect(wrapper.find('.reading-progress__bar').attributes('style')).toContain('width: 0%');
  });

  it('removes scroll listener on unmount', async () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const wrapper = mount(ReadingProgress);
    await flushPromises();
    wrapper.unmount();
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});
