type NavItem = {
  label: string;
  href: string;
};

type Social = {
  label: string;
  href: string;
  icon: 'github' | 'linkedin';
};

type WorkHours = {
  start: number;
  end: number;
  timezone: string;
  days: readonly [number, number];
};

type SiteConfig = {
  name: string;
  role: string;
  url: string;
  description: string;
  location: string;
  available: boolean;
  workHours: WorkHours;
  socials: Social[];
  nav: NavItem[];
};

export const SITE: SiteConfig = {
  name: 'Dmytro Tuzov',
  role: 'Frontend Engineer',
  url: 'https://dmytrotuzov.dev',
  description:
    'Senior Frontend Engineer with 7+ years building high-performance web applications. Specialising in Vue 3, TypeScript, and scalable architecture.',
  location: 'Montenegro',
  available: false,
  workHours: { start: 9, end: 18, timezone: 'Europe/Podgorica', days: [1, 5] } as const,
  socials: [
    { label: 'GitHub', href: 'https://github.com/2zovd', icon: 'github' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/dmitrytuzov', icon: 'linkedin' },
  ],
  nav: [
    { label: 'Work', href: '/portfolio' },
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ],
} as const;
