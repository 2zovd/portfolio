import type { CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'portfolio'>;
export type ProjectData = Project['data'];
