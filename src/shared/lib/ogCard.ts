import { SITE } from '@shared/config/site';

interface OgCardOptions {
  title: string;
  type: string;
}

function wrapTitle(text: string, maxLen = 42): [string] | [string, string] {
  if (text.length <= maxLen) return [text];
  const split = text.lastIndexOf(' ', maxLen);
  const breakAt = split > 0 ? split : maxLen;
  const line1 = text.slice(0, breakAt);
  const rest = text.slice(breakAt + (split > 0 ? 1 : 0));
  const line2 = rest.length > maxLen ? rest.slice(0, maxLen - 1) + '…' : rest;
  return [line1, line2];
}

export function generateOgCard({ title, type }: OgCardOptions): string {
  const lines = wrapTitle(title);
  const isTwoLines = lines.length === 2;
  const titleY1 = isTwoLines ? 270 : 300;
  const titleY2 = titleY1 + 60;

  const domain = SITE.url.replace('https://', '');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0c0c0a"/>

  <defs>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#grid)"/>

  <!-- Accent bar -->
  <rect x="96" y="96" width="48" height="4" fill="#c8f000"/>

  <!-- Type label -->
  <text x="96" y="148" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="500" fill="#c8f000" letter-spacing="0.08em">${type.toUpperCase()}</text>

  <!-- Title -->
  <text x="96" y="${titleY1}" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="600" fill="#e8e8e0" letter-spacing="-0.5">${escapeXml(lines[0])}</text>
  ${isTwoLines ? `<text x="96" y="${titleY2}" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="600" fill="#e8e8e0" letter-spacing="-0.5">${escapeXml(lines[1])}</text>` : ''}

  <!-- Author -->
  <text x="96" y="510" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="400" fill="#888888">${escapeXml(SITE.name)}</text>
  <text x="96" y="544" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="400" fill="#555555">${escapeXml(SITE.role)}</text>

  <!-- URL -->
  <text x="1104" y="544" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="400" fill="#555555" text-anchor="end">${escapeXml(domain)}</text>
</svg>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
