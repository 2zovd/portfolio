import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import HeroCanvas from './HeroCanvas.vue';

// jsdom doesn't implement ResizeObserver — provide a minimal stub
const observeSpy = vi.fn();
const disconnectSpy = vi.fn();

class ResizeObserverStub {
  observe = observeSpy;
  unobserve = vi.fn();
  disconnect = disconnectSpy;
}

// MutationObserver is present in jsdom but we spy on disconnect
const mutationDisconnectSpy = vi.fn();
const OriginalMutationObserver = globalThis.MutationObserver;
class MutationObserverStub {
  observe = vi.fn();
  disconnect = mutationDisconnectSpy;
  takeRecords = vi.fn(() => []);
}

const fakeCtx = {
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  strokeStyle: '',
  fillStyle: '',
  lineWidth: 0,
  globalAlpha: 1,
};

beforeEach(() => {
  observeSpy.mockClear();
  disconnectSpy.mockClear();
  mutationDisconnectSpy.mockClear();
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
  vi.stubGlobal('MutationObserver', MutationObserverStub);
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  // jsdom has no canvas 2d context — return a minimal mock so the component initialises fully
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(fakeCtx as unknown as CanvasRenderingContext2D);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  globalThis.MutationObserver = OriginalMutationObserver;
});

describe('HeroCanvas', () => {
  it('renders a canvas element with aria-hidden', () => {
    const wrapper = mount(HeroCanvas);
    const canvas = wrapper.find('canvas');
    expect(canvas.exists()).toBe(true);
    expect(canvas.attributes('aria-hidden')).toBe('true');
  });

  it('calls cancelAnimationFrame on unmount', async () => {
    const wrapper = mount(HeroCanvas);
    await flushPromises();
    wrapper.unmount();
    expect(cancelAnimationFrame).toHaveBeenCalled();
  });

  it('disconnects ResizeObserver on unmount', async () => {
    // Provide a parent section so ResizeObserver.observe is called
    const section = document.createElement('section');
    document.body.appendChild(section);

    const wrapper = mount(HeroCanvas, { attachTo: section });
    await flushPromises();
    wrapper.unmount();

    expect(disconnectSpy).toHaveBeenCalled();
    section.remove();
  });

  it('disconnects MutationObserver on unmount', async () => {
    const wrapper = mount(HeroCanvas, { attachTo: document.body });
    await flushPromises();
    wrapper.unmount();
    expect(mutationDisconnectSpy).toHaveBeenCalled();
  });

  it('removes mousemove and mouseleave listeners on unmount', async () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const wrapper = mount(HeroCanvas);
    await flushPromises();
    wrapper.unmount();
    const calls = removeSpy.mock.calls.map((c) => c[0]);
    expect(calls).toContain('mousemove');
    expect(calls).toContain('mouseleave');
  });
});
