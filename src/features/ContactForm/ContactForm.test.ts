import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ContactForm from './ContactForm.vue';

const mockTurnstileWidgetId = 'test-widget-id';
let turnstileCallback: ((token: string) => void) | null = null;

function setupTurnstile(): void {
  window.turnstile = {
    render: vi.fn((_, opts) => {
      turnstileCallback = opts.callback;
      return mockTurnstileWidgetId;
    }),
    reset: vi.fn(),
  };
}

function simulateTurnstileSuccess(): void {
  turnstileCallback?.('test-turnstile-token');
}

beforeEach(() => {
  turnstileCallback = null;
  setupTurnstile();
  vi.stubGlobal('fetch', vi.fn());
});

describe('ContactForm', () => {
  it('renders form in idle state', () => {
    const wrapper = mount(ContactForm);
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('.contact-form__success').exists()).toBe(false);
    expect(wrapper.find('.contact-form__error').exists()).toBe(false);
  });

  it('renders all visible fields with labels', () => {
    const wrapper = mount(ContactForm);
    expect(wrapper.find('label[for="cf-name"]').exists()).toBe(true);
    expect(wrapper.find('label[for="cf-email"]').exists()).toBe(true);
    expect(wrapper.find('label[for="cf-message"]').exists()).toBe(true);
    expect(wrapper.find('#cf-name').exists()).toBe(true);
    expect(wrapper.find('#cf-email').exists()).toBe(true);
    expect(wrapper.find('#cf-message').exists()).toBe(true);
  });

  it('all required inputs have aria-required', () => {
    const wrapper = mount(ContactForm);
    expect(wrapper.find('#cf-name').attributes('aria-required')).toBe('true');
    expect(wrapper.find('#cf-email').attributes('aria-required')).toBe('true');
    expect(wrapper.find('#cf-message').attributes('aria-required')).toBe('true');
  });

  it('honeypot field exists but is visually hidden', () => {
    const wrapper = mount(ContactForm);
    const honeypot = wrapper.find('#cf-honeypot');
    expect(honeypot.exists()).toBe(true);
    expect(honeypot.attributes('tabindex')).toBe('-1');
    const honeypotContainer = wrapper.find('.contact-form__honeypot');
    expect(honeypotContainer.attributes('aria-hidden')).toBe('true');
  });

  it('submit button is disabled without turnstile token', () => {
    const wrapper = mount(ContactForm);
    const btn = wrapper.find('button[type="submit"]');
    expect(btn.attributes('disabled')).toBeDefined();
  });

  it('submit button is enabled after turnstile resolves', async () => {
    const wrapper = mount(ContactForm);
    simulateTurnstileSuccess();
    await wrapper.vm.$nextTick();
    const btn = wrapper.find('button[type="submit"]');
    expect(btn.attributes('disabled')).toBeUndefined();
  });

  it('does not call fetch when turnstile token is empty', async () => {
    const fetchMock = vi.mocked(fetch);
    const wrapper = mount(ContactForm);
    await wrapper.find('form').trigger('submit');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shows loading text and disabled state while submitting', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );

    const wrapper = mount(ContactForm);
    simulateTurnstileSuccess();
    await wrapper.vm.$nextTick();

    const submitPromise = wrapper.find('form').trigger('submit');

    await wrapper.vm.$nextTick();
    const btn = wrapper.find('button[type="submit"]');
    expect(btn.text()).toBe('Sending…');
    expect(btn.attributes('disabled')).toBeDefined();
    expect(btn.attributes('aria-busy')).toBe('true');

    await submitPromise;
    await flushPromises();
  });

  it('shows success state after successful submission', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );

    const wrapper = mount(ContactForm);
    simulateTurnstileSuccess();
    await wrapper.vm.$nextTick();

    await wrapper.find('#cf-name').setValue('Alice');
    await wrapper.find('#cf-email').setValue('alice@example.com');
    await wrapper.find('#cf-message').setValue('Hello there!');

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.find('.contact-form__success').exists()).toBe(true);
    expect(wrapper.find('form').exists()).toBe(false);
    expect(wrapper.find('.contact-form__success-text').text()).toBe('Message sent!');
  });

  it('shows error message in aria-live region on failure', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ success: false, message: 'Server error' }), { status: 400 }),
    );

    const wrapper = mount(ContactForm);
    simulateTurnstileSuccess();
    await wrapper.vm.$nextTick();

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    const errorEl = wrapper.find('.contact-form__error');
    expect(errorEl.exists()).toBe(true);
    expect(errorEl.text()).toContain('Server error');
    expect(errorEl.attributes('aria-live')).toBe('polite');
    expect(errorEl.attributes('role')).toBe('alert');
  });

  it('shows network error message on fetch failure', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockRejectedValue(new Error('Network error'));

    const wrapper = mount(ContactForm);
    simulateTurnstileSuccess();
    await wrapper.vm.$nextTick();

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    const errorEl = wrapper.find('.contact-form__error');
    expect(errorEl.exists()).toBe(true);
    expect(errorEl.text()).toContain('Network error');
  });

  it('resets turnstile and token on error', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ success: false, message: 'Error' }), { status: 400 }),
    );
    const resetMock = vi.mocked(window.turnstile!.reset);

    const wrapper = mount(ContactForm);
    simulateTurnstileSuccess();
    await wrapper.vm.$nextTick();

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(resetMock).toHaveBeenCalledWith(mockTurnstileWidgetId);
    // Button should be disabled again (no token)
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
  });

  it('calls window.turnstile.render on mount', () => {
    mount(ContactForm);
    expect(window.turnstile!.render).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ sitekey: expect.any(String) }),
    );
  });
});
