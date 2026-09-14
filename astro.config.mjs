// @ts-check
import { defineConfig } from 'astro/config';

// Fully static output, served by Cloudflare Pages from dist/.
// format 'file' emits story.html rather than story/index.html, so URLs stay /story
// with no trailing slash (Cloudflare Pages drops the .html itself).
export default defineConfig({
  site: 'https://www.baguleyathletic.co.uk',
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
});
