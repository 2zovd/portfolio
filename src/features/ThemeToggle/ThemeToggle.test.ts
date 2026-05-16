import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ThemeToggle from './ThemeToggle.vue';

describe('ThemeToggle', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('light');
    localStorage.clear();
  });

  it('renders moon icon in dark mode', () => {
    document.documentElement.classList.remove('light');
    const wrapper = mount(ThemeToggle);
    const svgs = wrapper.findAll('svg');
    expect(svgs.length).toBe(1);
    expect(wrapper.find('path[d*="21 12.79"]').exists()).toBe(true);
  });

  it('renders sun icon in light mode', async () => {
    document.documentElement.classList.add('light');
    const wrapper = mount(ThemeToggle);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('circle').exists()).toBe(true);
  });

  it('has aria-label attribute', () => {
    const wrapper = mount(ThemeToggle);
    expect(wrapper.find('button').attributes('aria-label')).toBeTruthy();
  });

  it('toggles light class on document.documentElement when clicked', async () => {
    const wrapper = mount(ThemeToggle);
    expect(document.documentElement.classList.contains('light')).toBe(false);
    await wrapper.find('button').trigger('click');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    await wrapper.find('button').trigger('click');
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('writes theme to localStorage on click', async () => {
    const wrapper = mount(ThemeToggle);
    await wrapper.find('button').trigger('click');
    expect(localStorage.getItem('theme')).toBe('light');
    await wrapper.find('button').trigger('click');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('triggers toggle on Enter key', async () => {
    const wrapper = mount(ThemeToggle);
    await wrapper.find('button').trigger('keydown.enter');
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  it('triggers toggle on Space key', async () => {
    const wrapper = mount(ThemeToggle);
    await wrapper.find('button').trigger('keydown.space');
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });
});
