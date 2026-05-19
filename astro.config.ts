import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  adapter: cloudflare(),
  site: 'https://dmytrotuzov.dev',
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark-dimmed',
      },
      defaultColor: 'dark',
      wrap: false,
    },
  },
  integrations: [vue(), sitemap()],
  vite: {
    resolve: {
      alias: {
        '@shared': '/src/shared',
        '@features': '/src/features',
        '@widgets': '/src/widgets',
        '@entities': '/src/entities',
        '@app': '/src/app',
      },
    },
  },
});
