export interface SkillGroup {
  category: string;
  items: string[];
}

export const SKILLS: SkillGroup[] = [
  {
    category: 'Core',
    items: ['JavaScript (ES6+)', 'TypeScript', 'Vue 3', 'Pinia', 'Vuex', 'Vue Router'],
  },
  {
    category: 'Architecture',
    items: ['Microfrontends (UMD)', 'Backbone.js / Marionette', 'Backbone.Radio EventBus'],
  },
  {
    category: 'UI & Styling',
    items: ['SCSS Modules', 'Tailwind CSS', 'HTML5', 'CSS3'],
  },
  {
    category: 'Tooling',
    items: ['Vite', 'Webpack', 'Git', 'GitLab CI/CD'],
  },
  {
    category: 'Testing',
    items: ['Vitest', 'Jest'],
  },
  {
    category: 'AI & Automation',
    items: ['Claude Code', 'GitHub Copilot'],
  },
];
