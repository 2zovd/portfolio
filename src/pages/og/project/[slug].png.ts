import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { generateOgCard } from '@shared/lib/ogCard';

export const getStaticPaths: GetStaticPaths = async () => {
  const projects = await getCollection('portfolio');
  return projects.map((project) => ({
    params: { slug: project.id },
    props: { title: project.data.title },
  }));
};

export const GET: APIRoute<{ title: string }> = ({ props }) => {
  const svg = generateOgCard({ title: props.title, type: 'Project' });
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000',
    },
  });
};
