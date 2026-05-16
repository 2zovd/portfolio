import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import MobileNav from './MobileNav.vue';

describe('MobileNav', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
  });

  it('renders closed by default', () => {
    const wrapper = mount(MobileNav);
    expect(wrapper.find('#mobile-nav-overlay').exists()).toBe(false);
  });

  it('opens overlay when hamburger is clicked', async () => {
    const wrapper = mount(MobileNav);
    await wrapper.find('button').trigger('click');
    expect(wrapper.find('#mobile-nav-overlay').exists()).toBe(true);
  });

  it('closes overlay on second click', async () => {
    const wrapper = mount(MobileNav);
    await wrapper.find('button').trigger('click');
    await wrapper.find('button').trigger('click');
    expect(wrapper.find('#mobile-nav-overlay').exists()).toBe(false);
  });

  it('sets aria-expanded to false when closed', () => {
    const wrapper = mount(MobileNav);
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('false');
  });

  it('sets aria-expanded to true when open', async () => {
    const wrapper = mount(MobileNav);
    await wrapper.find('button').trigger('click');
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('true');
  });

  it('has correct aria-label when closed', () => {
    const wrapper = mount(MobileNav);
    expect(wrapper.find('button').attributes('aria-label')).toBe('Open navigation');
  });

  it('has correct aria-label when open', async () => {
    const wrapper = mount(MobileNav);
    await wrapper.find('button').trigger('click');
    expect(wrapper.find('button').attributes('aria-label')).toBe('Close navigation');
  });

  it('closes when Escape key is pressed', async () => {
    const wrapper = mount(MobileNav, { attachTo: document.body });
    await wrapper.find('button').trigger('click');
    expect(wrapper.find('#mobile-nav-overlay').exists()).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await wrapper.vm.$nextTick();
    expect(wrapper.find('#mobile-nav-overlay').exists()).toBe(false);
    wrapper.unmount();
  });

  it('renders all nav links when open', async () => {
    const wrapper = mount(MobileNav);
    await wrapper.find('button').trigger('click');
    const links = wrapper.findAll('.mobile-nav__link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('closes when a nav link is clicked', async () => {
    const wrapper = mount(MobileNav);
    await wrapper.find('button').trigger('click');
    const link = wrapper.find('.mobile-nav__link');
    await link.trigger('click');
    expect(wrapper.find('#mobile-nav-overlay').exists()).toBe(false);
  });
});
