import { getCollection, type CollectionEntry } from 'astro:content';

export type Story = CollectionEntry<'news'>;

// newest first
export const getNews = async () =>
  (await getCollection('news')).sort((a, b) => b.data.order - a.data.order);

// the standfirst if the story has one, otherwise its first paragraph as plain text
export const excerpt = (story: Story) =>
  story.data.summary ??
  (story.body ?? '')
    .trim()
    .split(/\n\s*\n/)[0]
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/[*_]/g, '');
