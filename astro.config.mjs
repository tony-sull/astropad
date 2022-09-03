import { defineConfig } from 'astro/config';
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import image from "@astrojs/image";

// https://astro.build/config
export default defineConfig({
  site: 'https://pad.astro.build',
  integrations: [mdx(), sitemap(), image()],
  vite: {
    ssr: {
      external: ["svgo"],
    },
  },
});