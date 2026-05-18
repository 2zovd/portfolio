import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import CodeCopy from './CodeCopy.vue';

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('navigator', {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
});

afterEach(() => {
  document.body.innerHTML = '';
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function mountWithPre(count = 1) {
  const prose = document.createElement('div');
  prose.className = 'prose';
  for (let i = 0; i < count; i++) {
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.textContent = `const x = ${i};`;
    pre.appendChild(code);
    prose.appendChild(pre);
  }
  document.body.appendChild(prose);
  return mount(CodeCopy, { attachTo: document.body });
}

describe('CodeCopy', () => {
  it('renders without error when no prose pre elements exist', () => {
    expect(() => mount(CodeCopy, { attachTo: document.body })).not.toThrow();
  });

  it('injects a copy button into each .prose pre element', async () => {
    mountWithPre(2);
    await flushPromises();
    const buttons = document.querySelectorAll('.code-copy-btn');
    expect(buttons).toHaveLength(2);
    expect(buttons[0]?.textContent).toBe('Copy');
  });

  it('wraps each pre in a .code-wrapper div', async () => {
    mountWithPre(1);
    await flushPromises();
    const wrapper = document.querySelector('.code-wrapper');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.querySelector('pre')).not.toBeNull();
  });

  it('calls clipboard.writeText with the code text on click', async () => {
    mountWithPre(1);
    await flushPromises();
    const btn = document.querySelector<HTMLButtonElement>('.code-copy-btn');
    btn?.click();
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('const x = 0;');
  });

  it('shows "Copied!" feedback after click and reverts after 2 s', async () => {
    mountWithPre(1);
    await flushPromises();
    const btn = document.querySelector<HTMLButtonElement>('.code-copy-btn');
    btn?.click();
    await flushPromises();
    expect(btn?.textContent).toBe('Copied!');
    expect(btn?.classList.contains('copied')).toBe(true);

    vi.advanceTimersByTime(2000);
    expect(btn?.textContent).toBe('Copy');
    expect(btn?.classList.contains('copied')).toBe(false);
  });
});
