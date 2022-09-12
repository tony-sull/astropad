import { defineConfig } from 'astro/config'

import image from '@astrojs/image'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'

// https://astro.build/config
export default defineConfig({
  site: 'https://astropad.netlify.app',
  integrations: [image(), mdx(), sitemap()],
  vite: {
    ssr: {
      external: ['svgo'],
    },
  },
})
