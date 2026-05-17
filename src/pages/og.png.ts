import type { APIRoute } from 'astro';
import { SITE } from '@shared/config/site';

export const GET: APIRoute = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0c0c0a"/>

  <!-- Grid lines -->
  <defs>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#grid)"/>

  <!-- Accent bar -->
  <rect x="96" y="96" width="48" height="4" fill="#c8f000"/>

  <!-- Name -->
  <text x="96" y="320" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="600" fill="#e8e8e0" letter-spacing="-1.5">${SITE.name}</text>

  <!-- Role -->
  <text x="96" y="390" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="400" fill="#888888">${SITE.role}</text>

  <!-- Location -->
  <text x="96" y="500" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="400" fill="#555555">${SITE.location}</text>

  <!-- URL -->
  <text x="1104" y="534" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="400" fill="#555555" text-anchor="end">${SITE.url.replace('https://', '')}</text>
</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
