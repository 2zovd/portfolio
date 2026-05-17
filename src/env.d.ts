/// <reference types="astro/client" />

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
