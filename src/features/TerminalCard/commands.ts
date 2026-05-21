import { SITE } from '@shared/config/site';
import { SKILLS } from '@shared/data/skills';

export type CommandResult = {
  output: string;
  type: 'info' | 'error' | 'success';
};

const skillsOutput = SKILLS.slice(0, 4)
  .map((g) => `  ${g.category.toLowerCase()}: ${g.items.slice(0, 4).join(' · ')}`)
  .join('\n');

const contactOutput = SITE.socials
  .map((s) => `  ${s.label.toLowerCase()}: ${s.href.replace('https://', '')}`)
  .join('\n') + '\n  email: /contact';

export const COMMANDS: Record<string, () => CommandResult> = {
  help: () => ({
    type: 'info',
    output: [
      '  whoami    — that\'s my line ;)',
      '  skills    — tech stack breakdown',
      '  projects  — portfolio work',
      '  contact   — get in touch',
      '  hire      — availability & rates',
      '  clear     — reset terminal',
      '  exit      — leave interactive mode',
    ].join('\n'),
  }),

  whoami: () => ({
    type: 'info',
    output: "  that's my line ;)",
  }),

  skills: () => ({
    type: 'info',
    output: skillsOutput,
  }),

  projects: () => ({
    type: 'info',
    output: '  Fintech Trading Platform  →  /portfolio',
  }),

  contact: () => ({
    type: 'info',
    output: contactOutput,
  }),

  hire: () => ({
    type: SITE.available ? 'success' : 'info',
    output: SITE.available
      ? '  available for new roles\n  reach out: /contact'
      : '  not actively looking, but open to the right role\n  open to: freelance · consulting · open source\n  /contact or linkedin.com/in/dmitrytuzov',
  }),

  exit: () => ({ type: 'info', output: '' }),
  clear: () => ({ type: 'info', output: '' }),
};

export function runCommand(input: string): CommandResult {
  const cmd = input.trim().toLowerCase();
  if (cmd === '') return { type: 'info', output: '' };
  const handler = COMMANDS[cmd];
  if (!handler) {
    return {
      type: 'error',
      output: `  command not found: ${cmd}\n  type 'help' for available commands`,
    };
  }
  return handler();
}
