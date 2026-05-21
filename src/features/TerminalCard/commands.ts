import { SITE } from '@shared/config/site';
import { SKILLS } from '@shared/data/skills';

export type CommandResult = {
  output: string;
  type: 'info' | 'error' | 'success';
};

const FORTUNES = [
  '"Make it work, make it right, make it fast." — Kent Beck',
  '"The best code is no code at all." — Jeff Atwood',
  '"Debugging is twice as hard as writing the code." — Kernighan',
  '"It works on my machine." — every developer, ever',
  "\"console.log('here')  // temporary, I swear\" — anonymous",
  '"Simplicity is the soul of efficiency." — Austin Freeman',
  '"ship it." — senior engineer energy',
  '"Any fool can write code a computer understands." — Fowler',
  '"First, solve the problem. Then, write the code." — Johnson',
  '"Programs must be written for people to read." — Abelson',
];

// Easter eggs kept from v1 — not listed in help
const skillsOutput = SKILLS.slice(0, 4)
  .map((g) => `  ${g.category.toLowerCase()}: ${g.items.slice(0, 4).join(' · ')}`)
  .join('\n');

const contactOutput =
  SITE.socials
    .map((s) => `  ${s.label.toLowerCase()}: ${s.href.replace('https://', '')}`)
    .join('\n') + '\n  email: /contact';

export const COMMANDS: Record<string, () => CommandResult> = {
  help: () => ({
    type: 'info',
    output: [
      '  uptime        — time in the field',
      '  man dmytro    — the manual page',
      '  fortune       — engineering wisdom',
      '  curl /api/bio — who am i, json edition',
      '  sudo [cmd]    — try your luck',
      '  interview     — apply for a role',
      '  ask [q]       — ask me anything',
      '  clear         — reset terminal',
    ].join('\n'),
  }),

  uptime: () => ({
    type: 'info',
    output: '  09:41:07 up 7 years, 3 months\n  load average: vue-3, typescript, coffee',
  }),

  'man dmytro': () => ({
    type: 'info',
    output: [
      '  DMYTRO(1)               User Commands               DMYTRO(1)',
      '',
      '  NAME',
      '        dmytro — frontend engineer, vue 3 specialist',
      '',
      '  SYNOPSIS',
      '        dmytro [--vue3] [--typescript] [--fintech] [--remote]',
      '',
      '  DESCRIPTION',
      '        7+ years shipping high-performance web applications.',
      '        Currently engineering trading terminals @ Libertex Group.',
      '',
      '  OPTIONS',
      '        --vue3        framework of choice (composition api only)',
      '        --typescript  strict mode. always.',
      '        --fintech     primary domain since oct 2018',
      '        --remote      preferred working mode',
      '',
      '  SEE ALSO',
      '        /portfolio, /blog, /contact',
    ].join('\n'),
  }),

  fortune: () => {
    const idx = Math.floor(Math.random() * FORTUNES.length);
    const quote = FORTUNES[idx] ?? '"ship it." — senior engineer energy';
    return { type: 'info', output: `  ${quote}` };
  },

  'curl /api/bio': () => ({
    type: 'success',
    output: [
      '  {',
      '    "name": "Dmytro Tuzov",',
      '    "role": "Frontend Engineer",',
      '    "location": "Remote",',
      '    "experience": "7+ years",',
      '    "stack": ["Vue 3", "TypeScript", "Astro", "SCSS"],',
      '    "domain": "fintech",',
      '    "currently": "building trading terminals @ Libertex",',
      '    "status": "crafting this very terminal right now"',
      '  }',
    ].join('\n'),
  }),

  // Easter eggs (not in help)
  whoami: () => ({ type: 'info', output: "  that's my line ;)" }),
  skills: () => ({ type: 'info', output: skillsOutput }),
  projects: () => ({ type: 'info', output: '  Fintech Trading Platform  →  /portfolio' }),
  contact: () => ({ type: 'info', output: contactOutput }),
  hire: () => ({
    type: SITE.available ? 'success' : 'info',
    output: SITE.available
      ? '  available for new roles\n  reach out: /contact'
      : '  not actively looking, but open to the right role\n  open to: freelance · consulting · open source\n  /contact or linkedin.com/in/dmitrytuzov',
  }),

  exit: () => ({ type: 'info', output: '' }),
  clear: () => ({ type: 'info', output: '' }),
};

function handleSudo(args: string): CommandResult {
  if (args === 'hire') return { type: 'error', output: '  Permission denied. NDA prevents further comment.' };
  if (args === 'rm -rf /') return { type: 'error', output: '  Nice try. Filesystem is read-only.' };
  if (args === 'apt-get install dmytro') return { type: 'error', output: '  Error: already installed at Libertex Group.' };
  if (args === 'make_me_coffee') return { type: 'success', output: '  brewing... ☕  done. (you\'re welcome)' };
  return { type: 'error', output: '  This incident will be reported.' };
}

export function runCommand(input: string): CommandResult {
  const cmd = input.trim().toLowerCase();
  if (cmd === '') return { type: 'info', output: '' };

  if (cmd === 'sudo' || cmd.startsWith('sudo ')) {
    return handleSudo(cmd.slice(4).trim());
  }

  const handler = COMMANDS[cmd];
  if (!handler) {
    return {
      type: 'error',
      output: `  command not found: ${cmd}\n  type 'help' for available commands`,
    };
  }
  return handler();
}
