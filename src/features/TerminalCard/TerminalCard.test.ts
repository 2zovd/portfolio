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
});

describe('TerminalCard — commands', () => {
  it('executes help and shows new command list', async () => {
    const wrapper = await mountInteractive();
    await runCmd(wrapper, 'help');
    const text = wrapper.text();
    expect(text).toContain('uptime');
    expect(text).toContain('interview');
    expect(text).toContain('ask');
  });

  it('executes uptime and shows developer uptime', async () => {
    const wrapper = await mountInteractive();
    await runCmd(wrapper, 'uptime');
    expect(wrapper.text()).toContain('7 years');
    expect(wrapper.text()).toContain('coffee');
  });

  it('executes man dmytro and shows manual page', async () => {
    const wrapper = await mountInteractive();
    await runCmd(wrapper, 'man dmytro');
    const text = wrapper.text();
    expect(text).toContain('DMYTRO(1)');
    expect(text).toContain('--typescript');
  });

  it('executes fortune and shows a quote', async () => {
    const wrapper = await mountInteractive();
    await runCmd(wrapper, 'fortune');
    const output = wrapper.find('.terminal__output--info');
    expect(output.exists()).toBe(true);
    expect(output.text().length).toBeGreaterThan(5);
  });

  it('executes curl /api/bio and shows JSON', async () => {
    const wrapper = await mountInteractive();
    await runCmd(wrapper, 'curl /api/bio');
    const text = wrapper.text();
    expect(text).toContain('Dmytro Tuzov');
    expect(text).toContain('fintech');
  });

  it('sudo hire returns permission denied', async () => {
    const wrapper = await mountInteractive();
    await runCmd(wrapper, 'sudo hire');
    expect(wrapper.text()).toContain('Permission denied');
    expect(wrapper.find('.terminal__output--error').exists()).toBe(true);
  });

  it('sudo rm -rf / returns filesystem-read-only message', async () => {
    const wrapper = await mountInteractive();
    await runCmd(wrapper, 'sudo rm -rf /');
    expect(wrapper.text()).toContain('read-only');
  });

  it('sudo unknown command reports incident', async () => {
    const wrapper = await mountInteractive();
    await runCmd(wrapper, 'sudo something');
    expect(wrapper.text()).toContain('incident');
    expect(wrapper.find('.terminal__output--error').exists()).toBe(true);
  });

  it('shows error for unknown command', async () => {
    const wrapper = await mountInteractive();
    await runCmd(wrapper, 'foobar');
    expect(wrapper.text()).toContain('command not found: foobar');
    expect(wrapper.find('.terminal__output--error').exists()).toBe(true);
  });

  it('clears history on clear command', async () => {
    const wrapper = await mountInteractive();
    await runCmd(wrapper, 'help');
    await runCmd(wrapper, 'clear');
    expect(wrapper.findAll('.terminal__line--group').length).toBe(0);
  });

  it('ignores empty input on Enter', async () => {
    const wrapper = await mountInteractive();
    await runCmd(wrapper, '');
    expect(wrapper.findAll('.terminal__line--group').length).toBe(0);
  });

  it('whoami easter egg still works', async () => {
    const wrapper = await mountInteractive();
    await runCmd(wrapper, 'whoami');
    expect(wrapper.text()).toContain("that's my line");
  });

  it('skills easter egg still works', async () => {
    const wrapper = await mountInteractive();
    await runCmd(wrapper, 'skills');
    expect(wrapper.text()).toContain('TypeScript');
  });
});

describe('TerminalCard — interview', () => {
  it('starts interview with initial message and first question', async () => {
    const wrapper = await mountInteractive();
    await runCmd(wrapper, 'interview');
    const text = wrapper.text();
    expect(text).toContain('Starting interview session');
    expect(text).toContain('Q 1/4');
  });

  it('advances through all 4 questions and shows completion', async () => {
    const wrapper = await mountInteractive();
    await runCmd(wrapper, 'interview');

    const answers = ['TypeScript everywhere', 'refactor incrementally', 'Vue 3', 'relentless'];
    for (const answer of answers) {
      await runCmd(wrapper, answer);
    }

    expect(wrapper.text()).toContain('Interview complete');
    expect(wrapper.text()).toContain('Strong candidate');
  });

  it('clear during interview resets interview state', async () => {
    const wrapper = await mountInteractive();
    await runCmd(wrapper, 'interview');
    await runCmd(wrapper, 'clear');
    // After clear, the next input should run as a command, not an interview answer
    await runCmd(wrapper, 'foobar');
    expect(wrapper.text()).toContain('command not found: foobar');
  });
});

describe('TerminalCard — ask command', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows usage error when ask has no question', async () => {
    const wrapper = await mountInteractive();
    await runCmd(wrapper, 'ask');
    expect(wrapper.text()).toContain('usage: ask [your question]');
    expect(wrapper.find('.terminal__output--error').exists()).toBe(true);
  });

  it('shows thinking then AI response on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ answer: 'I love Vue 3 and fintech.' }),
      }),
    );

    const wrapper = await mountInteractive();
    await runCmd(wrapper, 'ask what do you love?');
    await flushPromises();

    expect(wrapper.text()).toContain('I love Vue 3 and fintech.');
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
  it('recalls previous command with ArrowUp', async () => {
    const wrapper = await mountInteractive();
    const input = wrapper.find('.terminal__input');
    await runCmd(wrapper, 'help');
    await input.setValue('');
    await input.trigger('keydown', { key: 'ArrowUp' });
    await wrapper.vm.$nextTick();
    expect((input.element as HTMLInputElement).value).toBe('help');
  });

  it('clears input with ArrowDown past end of history', async () => {
    const wrapper = await mountInteractive();
    const input = wrapper.find('.terminal__input');
    await runCmd(wrapper, 'help');
    await input.trigger('keydown', { key: 'ArrowUp' });
    await wrapper.vm.$nextTick();
    await input.trigger('keydown', { key: 'ArrowDown' });
    await wrapper.vm.$nextTick();
    expect((input.element as HTMLInputElement).value).toBe('');
  });
});
