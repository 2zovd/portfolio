import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://dmytrotuzov.dev',
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
