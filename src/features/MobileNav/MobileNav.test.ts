import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import MobileNav from './MobileNav.vue';

// Teleport is stubbed to render inline so wrapper.find() reaches overlay elements
const MOUNT_OPTS = {
  global: { stubs: { Teleport: { template: '<slot />' } } },
} as const;

function mountNav(extra: Parameters<typeof mount>[1] = {}) {
  return mount(MobileNav, { ...MOUNT_OPTS, ...extra });
}

beforeEach(() => {
  document.body.style.overflow = '';
  // Default pathname for all tests
  vi.stubGlobal('location', { pathname: '/' });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('MobileNav', () => {
  it('renders closed by default', () => {
    const wrapper = mountNav();
    expect(wrapper.find('#mobile-nav-overlay').exists()).toBe(false);
  });

  it('opens overlay when hamburger is clicked', async () => {
    const wrapper = mountNav();
    await wrapper.find('button').trigger('click');
    expect(wrapper.find('#mobile-nav-overlay').exists()).toBe(true);
  });

  it('closes overlay when hamburger is clicked while open', async () => {
    const wrapper = mountNav();
    await wrapper.find('button').trigger('click');
    await wrapper.find('button').trigger('click');
    expect(wrapper.find('#mobile-nav-overlay').exists()).toBe(false);
  });

  it('closes overlay when close button inside overlay is clicked', async () => {
    const wrapper = mountNav();
    await wrapper.find('button').trigger('click');
    expect(wrapper.find('#mobile-nav-overlay').exists()).toBe(true);
    const closeBtn = wrapper.find('.mobile-nav__close');
    expect(closeBtn.exists()).toBe(true);
    await closeBtn.trigger('click');
    expect(wrapper.find('#mobile-nav-overlay').exists()).toBe(false);
  });

  it('sets aria-expanded to false when closed', () => {
    const wrapper = mountNav();
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('false');
  });

  it('sets aria-expanded to true when open', async () => {
    const wrapper = mountNav();
    await wrapper.find('button').trigger('click');
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('true');
  });

  it('has correct aria-label when closed', () => {
    const wrapper = mountNav();
    expect(wrapper.find('button').attributes('aria-label')).toBe('Open navigation');
  });

  it('has correct aria-label when open', async () => {
    const wrapper = mountNav();
    await wrapper.find('button').trigger('click');
    expect(wrapper.find('button').attributes('aria-label')).toBe('Close navigation');
  });

  it('closes when Escape key is pressed', async () => {
    const wrapper = mountNav({ attachTo: document.body });
    await wrapper.find('button').trigger('click');
    expect(wrapper.find('#mobile-nav-overlay').exists()).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await wrapper.vm.$nextTick();
    expect(wrapper.find('#mobile-nav-overlay').exists()).toBe(false);
    wrapper.unmount();
  });

  it('renders all nav links when open', async () => {
    const wrapper = mountNav();
    await wrapper.find('button').trigger('click');
    const links = wrapper.findAll('.mobile-nav__link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('closes when a nav link is clicked', async () => {
    const wrapper = mountNav();
    await wrapper.find('button').trigger('click');
    const link = wrapper.find('.mobile-nav__link');
    await link.trigger('click');
    expect(wrapper.find('#mobile-nav-overlay').exists()).toBe(false);
  });

  it('uses CSS hamburger bars instead of inline SVGs for the trigger icon', () => {
    const wrapper = mountNav();
    expect(wrapper.find('.hamburger').exists()).toBe(true);
    expect(wrapper.findAll('.bar').length).toBe(3);
  });

  it('trigger gets is-open class when overlay is open', async () => {
    const wrapper = mountNav();
    expect(wrapper.find('.mobile-nav__trigger').classes()).not.toContain('is-open');
    await wrapper.find('button').trigger('click');
    expect(wrapper.find('.mobile-nav__trigger').classes()).toContain('is-open');
  });

  it('active link gets aria-current="page" when path matches', async () => {
    vi.stubGlobal('location', { pathname: '/portfolio' });
    const wrapper = mountNav();
    await wrapper.vm.$nextTick();
    await wrapper.find('button').trigger('click');
    const activeLink = wrapper.find('.mobile-nav__link--active');
    expect(activeLink.exists()).toBe(true);
    expect(activeLink.attributes('aria-current')).toBe('page');
  });

  it('no link is active when path does not match any nav item', async () => {
    vi.stubGlobal('location', { pathname: '/nonexistent' });
    const wrapper = mountNav();
    await wrapper.vm.$nextTick();
    await wrapper.find('button').trigger('click');
    expect(wrapper.find('.mobile-nav__link--active').exists()).toBe(false);
  });
});
