/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_TURNSTILE_SITE_KEY: string;
  readonly TURNSTILE_SECRET_KEY: string;
  readonly RESEND_API_KEY: string;
  readonly CONTACT_TO_EMAIL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent;
  export default component;
}

interface Window {
  turnstile?: {
    render: (
      el: HTMLElement,
      opts: {
        sitekey: string;
        callback: (token: string) => void;
        'expired-callback': () => void;
      },
    ) => string;
    reset: (id: string) => void;
  };
}
