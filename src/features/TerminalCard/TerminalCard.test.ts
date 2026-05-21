import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import TerminalCard from './TerminalCard.vue';
import { useTerminalSession } from './useTerminalSession';

async function mountInteractive() {
  const wrapper = mount(TerminalCard);
  await wrapper.find('.terminal').trigger('click');
  await wrapper.vm.$nextTick();
  return wrapper;
}

async function runCmd(wrapper: Awaited<ReturnType<typeof mountInteractive>>, cmd: string) {
  const input = wrapper.find('.terminal__input');
  await input.setValue(cmd);
  await input.trigger('keydown', { key: 'Enter' });
  await wrapper.vm.$nextTick();
}

describe('TerminalCard — static state', () => {
  it('renders static whoami/location/experience/stack lines', () => {
    const wrapper = mount(TerminalCard);
    const text = wrapper.text();
    expect(text).toContain('whoami');
    expect(text).toContain('location');
    expect(text).toContain('experience');
    expect(text).toContain('stack');
  });

  it('shows blinking cursor when not interactive', () => {
    const wrapper = mount(TerminalCard);
    expect(wrapper.find('.terminal__cursor').exists()).toBe(true);
    expect(wrapper.find('.terminal__input').exists()).toBe(false);
  });

  it('has tabindex on container for keyboard access', () => {
    const wrapper = mount(TerminalCard);
    expect(wrapper.find('.terminal').attributes('tabindex')).toBe('0');
  });

  it('has role="log" and aria-live on body', () => {
    const wrapper = mount(TerminalCard);
    const body = wrapper.find('[role="log"]');
    expect(body.exists()).toBe(true);
    expect(body.attributes('aria-live')).toBe('polite');
  });
});

describe('TerminalCard — entering interactive mode', () => {
  it('shows input after click', async () => {
    const wrapper = await mountInteractive();
    expect(wrapper.find('.terminal__input').exists()).toBe(true);
    expect(wrapper.find('.terminal__cursor').exists()).toBe(false);
  });

  it('adds terminal--active class on click', async () => {
    const wrapper = await mountInteractive();
    expect(wrapper.find('.terminal').classes()).toContain('terminal--active');
  });

  it('enters interactive mode on Enter key', async () => {
    const wrapper = mount(TerminalCard);
    await wrapper.find('.terminal').trigger('keydown', { key: 'Enter' });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.terminal__input').exists()).toBe(true);
  });

  it('enters interactive mode on Space key', async () => {
    const wrapper = mount(TerminalCard);
    await wrapper.find('.terminal').trigger('keydown', { key: ' ' });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.terminal__input').exists()).toBe(true);
  });

  it('shows welcome message on first activation', async () => {
    const wrapper = await mountInteractive();
    expect(wrapper.text()).toContain('Ask me anything');
  });

  it('does not repeat welcome message on re-entry when history exists', async () => {
    const wrapper = await mountInteractive();
    // Exit, re-enter — history is not empty so welcome should not be pushed again
    await wrapper.find('.terminal').trigger('keydown', { key: 'Escape' });
    await wrapper.vm.$nextTick();
    await wrapper.find('.terminal').trigger('click');
    await wrapper.vm.$nextTick();
    const groups = wrapper.findAll('.terminal__line--group');
    // Only the initial welcome entry (command='') should exist, no duplicates
    expect(groups.length).toBe(1);
  });
});

describe('TerminalCard — help command', () => {
  it('shows example questions and reserved commands', async () => {
    const wrapper = await mountInteractive();
    await runCmd(wrapper, 'help');
    const text = wrapper.text();
    expect(text).toContain('Just type your question');
    expect(text).toContain('clear');
    expect(text).toContain('exit');
  });
});

describe('TerminalCard — reserved commands', () => {
  it('clear resets history', async () => {
    const wrapper = await mountInteractive();
    await runCmd(wrapper, 'help');
    await runCmd(wrapper, 'clear');
    expect(wrapper.findAll('.terminal__line--group').length).toBe(0);
  });

  it('ignores empty input on Enter', async () => {
    const wrapper = await mountInteractive();
    // Only the welcome entry (command='') exists; empty input adds nothing
    const before = wrapper.findAll('.terminal__line--group').length;
    await runCmd(wrapper, '');
    expect(wrapper.findAll('.terminal__line--group').length).toBe(before);
  });

  it('bare ask shows usage hint', async () => {
    const wrapper = await mountInteractive();
    await runCmd(wrapper, 'ask');
    expect(wrapper.text()).toContain('usage: ask [question]');
    expect(wrapper.find('.terminal__output--error').exists()).toBe(true);
  });
});

describe('TerminalCard — implicit AI routing', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends plain question to AI without ask prefix', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ answer: 'Vue 3 is my main framework.' }),
      }),
    );

    const wrapper = await mountInteractive();
    await runCmd(wrapper, 'what is your tech stack?');
    await flushPromises();

    expect(wrapper.text()).toContain('Vue 3 is my main framework.');
  });

  it('ask prefix still works as explicit form', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ answer: 'I love fintech challenges.' }),
      }),
    );

    const wrapper = await mountInteractive();
    await runCmd(wrapper, 'ask what do you enjoy?');
    await flushPromises();

    expect(wrapper.text()).toContain('I love fintech challenges.');
  });

  it('shows error when question exceeds 200 chars without fetching', async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
    const wrapper = await mountInteractive();
    await runCmd(wrapper, 'x'.repeat(201));
    await flushPromises();
    expect(wrapper.text()).toContain('question too long');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('shows thinking then AI response on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ answer: 'I love Vue 3 and fintech.' }),
      }),
    );

    const wrapper = await mountInteractive();
    await runCmd(wrapper, 'ask what do you love?');
    await flushPromises();

    expect(wrapper.text()).toContain('I love Vue 3 and fintech.');
  });

  it('shows rate limit message on 429 response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: 'rate limit: try again in a few minutes' }),
      }),
    );

    const wrapper = await mountInteractive();
    await runCmd(wrapper, 'ask anything');
    await flushPromises();

    expect(wrapper.text()).toContain('rate limit reached');
    expect(wrapper.find('.terminal__output--error').exists()).toBe(true);
  });

  it('shows AI unavailable message on 503 response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({ error: 'AI temporarily unavailable' }),
      }),
    );

    const wrapper = await mountInteractive();
    await runCmd(wrapper, 'ask anything');
    await flushPromises();

    expect(wrapper.text()).toContain('AI is temporarily unavailable');
    expect(wrapper.find('.terminal__output--error').exists()).toBe(true);
  });

  it('shows connection error on fetch failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('network error')));

    const wrapper = await mountInteractive();
    await runCmd(wrapper, 'ask anything');
    await flushPromises();

    expect(wrapper.text()).toContain('connection error');
    expect(wrapper.find('.terminal__output--error').exists()).toBe(true);
  });
});

describe('TerminalCard — exiting interactive mode', () => {
  it('exit command sets isInteractive to false (composable)', async () => {
    const session = useTerminalSession(() => {});
    session.enter();
    expect(session.isInteractive.value).toBe(true);
    session.inputValue.value = 'exit';
    await session.execute();
    expect(session.isInteractive.value).toBe(false);
  });

  it('exits on Escape key (component)', async () => {
    const wrapper = await mountInteractive();
    await wrapper.find('.terminal').trigger('keydown', { key: 'Escape' });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.terminal__input').exists()).toBe(false);
    expect(wrapper.find('.terminal__cursor').exists()).toBe(true);
  });
});

describe('TerminalCard — command history navigation', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('recalls previous command with ArrowUp', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ answer: 'yes' }),
      }),
    );

    const wrapper = await mountInteractive();
    const input = wrapper.find('.terminal__input');
    await runCmd(wrapper, 'what is your stack?');
    await flushPromises();
    await input.setValue('');
    await input.trigger('keydown', { key: 'ArrowUp' });
    await wrapper.vm.$nextTick();
    expect((input.element as HTMLInputElement).value).toBe('what is your stack?');
  });

  it('clears input with ArrowDown past end of history', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ answer: 'yes' }),
      }),
    );

    const wrapper = await mountInteractive();
    const input = wrapper.find('.terminal__input');
    await runCmd(wrapper, 'what is your stack?');
    await flushPromises();
    await input.trigger('keydown', { key: 'ArrowUp' });
    await wrapper.vm.$nextTick();
    await input.trigger('keydown', { key: 'ArrowDown' });
    await wrapper.vm.$nextTick();
    expect((input.element as HTMLInputElement).value).toBe('');
  });
});
