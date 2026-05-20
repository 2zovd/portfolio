export interface Job {
  company: string;
  role: string;
  period: string;
  location: string;
  highlights: string[];
}

export const EXPERIENCE: Job[] = [
  {
    company: 'Libertex Group',
    role: 'Frontend Engineer',
    period: 'Oct 2018 — Present',
    location: 'Remote',
    highlights: [
      'Shipped features across a hybrid trading terminal built on Backbone.js / Marionette — a large-scale legacy codebase — working across ES5/AMD modules and TypeScript strict-mode code within the same production system.',
      'Architected a Vue 3 / TypeScript / Pinia microfrontend for an AI-powered trading feature used by millions of platform users — Pinia stores, Axios with JWT interceptors, SCSS Modules, Vite UMD bundle, Crowdin i18n.',
      'Delivered a Vue 3 / Vuex 4 microfrontend in JavaScript with Tailwind CSS and a broker-aware service layer, targeting desktop web and native mobile (iOS/Android); integrated both microfrontends with the host via Backbone.Radio EventBus.',
      'Drove ongoing modernisation of the frontend stack (JavaScript → TypeScript, Vuex → Pinia) and integrated AI tooling (Claude Code, GitHub Copilot) as part of daily workflow.',
      'Led code reviews and onboarding within a cross-functional team of 8 in an Agile environment.',
    ],
  },
  {
    company: 'Mobilsoft',
    role: 'UI Developer',
    period: 'Feb 2017 — Mar 2018',
    location: 'Remote',
    highlights: [
      'Built responsive, accessible UIs for an iGaming platform, including interactive game interfaces with optimised animation performance and cross-device compatibility.',
      'Enhanced Laravel-based applications on the frontend side.',
    ],
  },
  {
    company: 'Contract Frontend Developer',
    role: 'Frontend Developer',
    period: 'Jul 2016 — Jun 2018',
    location: 'Remote',
    highlights: [
      'Delivered frontend projects for international clients via direct contracts and Upwork: responsive landing pages, business websites, and a learning platform.',
    ],
  },
  {
    company: 'URB',
    role: 'UI Developer',
    period: 'Dec 2015 — Jun 2016',
    location: 'Remote',
    highlights: [
      'Built the complete frontend for a social platform from scratch (desktop and mobile web) — semantic HTML, responsive layouts, cross-browser compatibility. The platform remains in production to this day.',
    ],
  },
];
