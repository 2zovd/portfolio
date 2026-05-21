import { ref, nextTick } from 'vue';

export type HistoryEntry = {
  command: string;
  output: string;
  type: 'info' | 'error' | 'success';
};

const HELP_OUTPUT = [
  '  Just type your question — no prefix needed.',
  '',
  '    e.g. "what\'s your tech stack?"',
  '         "tell me about Libertex"',
  '         "are you open to freelance?"',
  '',
  '  ask [question]   — explicit form',
  '  clear            — reset conversation',
  '  exit             — close',
].join('\n');

const WELCOME_OUTPUT = '  Hi! Ask me anything about my work and experience.';

const MAX_QUESTION_LENGTH = 200;

export function useTerminalSession(scrollToBottom: () => void) {
  const isInteractive = ref(false);
  const inputValue = ref('');
  const outputHistory = ref<HistoryEntry[]>([]);
  const cmdHistory = ref<string[]>([]);
  const cmdHistoryIndex = ref(-1);

  function enter() {
    isInteractive.value = true;
    if (outputHistory.value.length === 0) {
      outputHistory.value.push({ command: '', output: WELCOME_OUTPUT, type: 'info' });
    }
  }

  function exit() {
    isInteractive.value = false;
    inputValue.value = '';
    cmdHistoryIndex.value = -1;
  }

  async function askAI(raw: string, question: string) {
    if (question.length > MAX_QUESTION_LENGTH) {
      outputHistory.value.push({
        command: raw,
        output: `  question too long (max ${MAX_QUESTION_LENGTH} chars)`,
        type: 'error',
      });
      await nextTick();
      scrollToBottom();
      return;
    }

    if (raw !== cmdHistory.value[0]) cmdHistory.value.unshift(raw);

    const idx = outputHistory.value.length;
    outputHistory.value.push({ command: raw, output: '  thinking...', type: 'info' });
    await nextTick();
    scrollToBottom();

    try {
      const res = await fetch('/api/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      let output: string;
      let type: 'info' | 'error';
      if (res.status === 429) {
        output = '  rate limit reached. try again in a few minutes.';
        type = 'error';
      } else if (res.status === 503) {
        output = '  AI is temporarily unavailable. try again later.';
        type = 'error';
      } else if (!res.ok) {
        output = '  connection error. try again later.';
        type = 'error';
      } else {
        const data = (await res.json()) as { answer: string };
        output = `  ${data.answer}`;
        type = 'info';
      }
      outputHistory.value[idx] = { command: raw, output, type };
    } catch {
      outputHistory.value[idx] = {
        command: raw,
        output: '  connection error. try again later.',
        type: 'error',
      };
    }

    await nextTick();
    scrollToBottom();
  }

  async function execute() {
    const raw = inputValue.value.trim();
    inputValue.value = '';
    cmdHistoryIndex.value = -1;

    if (raw === '') return;

    const lower = raw.toLowerCase();

    if (lower === 'exit') {
      exit();
      await nextTick();
      return;
    }

    if (lower === 'clear') {
      outputHistory.value = [];
      await nextTick();
      return;
    }

    if (lower === 'help') {
      if (raw !== cmdHistory.value[0]) cmdHistory.value.unshift(raw);
      outputHistory.value.push({ command: raw, output: HELP_OUTPUT, type: 'info' });
      await nextTick();
      scrollToBottom();
      return;
    }

    if (lower === 'ask') {
      outputHistory.value.push({
        command: raw,
        output: '  usage: ask [question] — or just type directly',
        type: 'error',
      });
      await nextTick();
      scrollToBottom();
      return;
    }

    // Everything else: implicit AI question. Strip optional 'ask ' prefix.
    const question = lower.startsWith('ask ') ? raw.slice(4).trim() : raw;
    await askAI(raw, question);
  }

  function navigateHistory(direction: -1 | 1) {
    const len = cmdHistory.value.length;
    if (len === 0) return;

    const next = cmdHistoryIndex.value - direction;
    if (next < -1 || next >= len) return;

    cmdHistoryIndex.value = next;
    inputValue.value = next === -1 ? '' : (cmdHistory.value[next] ?? '');
  }

  return {
    isInteractive,
    inputValue,
    outputHistory,
    enter,
    exit,
    execute,
    navigateHistory,
  };
}
