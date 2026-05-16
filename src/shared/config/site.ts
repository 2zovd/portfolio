type NavItem = {
  label: string;
  href: string;
};

type Social = {
  label: string;
  href: string;
  icon: 'github' | 'linkedin' | 'telegram';
};

type SiteConfig = {
  name: string;
  role: string;
  url: string;
  description: string;
  location: string;
  available: boolean;
  email: string;
  socials: Social[];
  nav: NavItem[];
};

export const SITE: SiteConfig = {
  name: 'Dmytro Tuzov',
  role: 'Frontend Engineer',
  url: 'https://dmytrotuzov.dev',
  description:
    'Frontend Engineer with 7+ years building high-performance web applications. Specialising in Vue 3, TypeScript, and scalable architecture.',
  location: 'Montenegro · Remote',
  available: true,
  email: 'dmy2zov@gmail.com',
  socials: [
    { label: 'GitHub', href: 'https://github.com/2zovd', icon: 'github' },
    {
      label: 'LinkedIn',
      href: 'https://linkedin.com/in/dmytrotuzov',
      icon: 'linkedin',
    },
    { label: 'Telegram', href: 'https://t.me/dmytrotuzov', icon: 'telegram' },
  ],
  nav: [
    { label: 'Work', href: '/portfolio' },
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ],
} as const;
