import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import { fileURLToPath } from 'url';

const varsPath = fileURLToPath(new URL('./src/app/styles/_vars', import.meta.url));

export default defineConfig({
  adapter: cloudflare({ imageService: 'passthrough' }),
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
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "${varsPath}" as *;\n`,
        },
      },
    },
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
