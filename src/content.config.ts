import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Club news: one Markdown file per story in src/content/news/. The filename is the URL slug
// (charity-event-victory.md → /news/charity-event-victory).
const news = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    // stories have no dates yet, so order is explicit: higher is newer. A new story takes the
    // next number up, and nothing else needs renumbering.
    order: z.number(),
    // optional one-line standfirst under the headline; cards fall back to the first paragraph
    summary: z.string().optional(),
    image: z.string(),
    imageAlt: z.string(),
  }),
});

export const collections = { news };
