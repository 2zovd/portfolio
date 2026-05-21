import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import TerminalCard from './TerminalCard.vue';
import { useTerminalSession } from './useTerminalSession';

async function mountInteractive() {
  const wrapper = mount(TerminalCard);
  await wrapper.find('.terminal').trigger('click');
  await wrapper.vm.$nextTick();
  return wrapper;
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
  it('executes help and shows output', async () => {
    const wrapper = await mountInteractive();
    const input = wrapper.find('.terminal__input');
    await input.setValue('help');
    await input.trigger('keydown', { key: 'Enter' });
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('whoami');
    expect(wrapper.text()).toContain('skills');
    expect(wrapper.text()).toContain('projects');
  });

  it('executes whoami and shows easter egg', async () => {
    const wrapper = await mountInteractive();
    const input = wrapper.find('.terminal__input');
    await input.setValue('whoami');
    await input.trigger('keydown', { key: 'Enter' });
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain("that's my line");
  });

  it('executes skills and shows tech stack', async () => {
    const wrapper = await mountInteractive();
    const input = wrapper.find('.terminal__input');
    await input.setValue('skills');
    await input.trigger('keydown', { key: 'Enter' });
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('TypeScript');
  });

  it('executes contact and shows socials', async () => {
    const wrapper = await mountInteractive();
    const input = wrapper.find('.terminal__input');
    await input.setValue('contact');
    await input.trigger('keydown', { key: 'Enter' });
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('github.com');
  });

  it('executes hire and shows availability', async () => {
    const wrapper = await mountInteractive();
    const input = wrapper.find('.terminal__input');
    await input.setValue('hire');
    await input.trigger('keydown', { key: 'Enter' });
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('hire');
  });

  it('shows error for unknown command', async () => {
    const wrapper = await mountInteractive();
    const input = wrapper.find('.terminal__input');
    await input.setValue('foobar');
    await input.trigger('keydown', { key: 'Enter' });
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('command not found: foobar');
    expect(wrapper.find('.terminal__output--error').exists()).toBe(true);
  });

  it('clears history on clear command', async () => {
    const wrapper = await mountInteractive();
    const input = wrapper.find('.terminal__input');
    await input.setValue('help');
    await input.trigger('keydown', { key: 'Enter' });
    await wrapper.vm.$nextTick();
    await input.setValue('clear');
    await input.trigger('keydown', { key: 'Enter' });
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('.terminal__line--group').length).toBe(0);
  });

  it('ignores empty input on Enter', async () => {
    const wrapper = await mountInteractive();
    const input = wrapper.find('.terminal__input');
    await input.setValue('');
    await input.trigger('keydown', { key: 'Enter' });
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('.terminal__line--group').length).toBe(0);
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
    await input.setValue('help');
    await input.trigger('keydown', { key: 'Enter' });
    await wrapper.vm.$nextTick();
    await input.setValue('');
    await input.trigger('keydown', { key: 'ArrowUp' });
    await wrapper.vm.$nextTick();
    expect((input.element as HTMLInputElement).value).toBe('help');
  });

  it('clears input with ArrowDown past end of history', async () => {
    const wrapper = await mountInteractive();
    const input = wrapper.find('.terminal__input');
    await input.setValue('help');
    await input.trigger('keydown', { key: 'Enter' });
    await wrapper.vm.$nextTick();
    await input.trigger('keydown', { key: 'ArrowUp' });
    await wrapper.vm.$nextTick();
    await input.trigger('keydown', { key: 'ArrowDown' });
    await wrapper.vm.$nextTick();
    expect((input.element as HTMLInputElement).value).toBe('');
  });
});
