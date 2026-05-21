import { ref, nextTick } from 'vue';

export type HistoryEntry = {
  command?: string;
  output: string;
  type: 'info' | 'error' | 'success';
  contactLink?: string;
};

const HELP_OUTPUT = [
  'Just type your question — no prefix needed.',
  '',
  '  e.g. "what\'s your tech stack?"',
  '       "what projects have you shipped?"',
  '       "are you open to freelance?"',
  '',
  'ask [question]   — explicit form',
  'clear            — reset conversation',
].join('\n');

const WELCOME_OUTPUT = 'Hi! Ask me anything about my work and experience.';

const MAX_QUESTION_LENGTH = 200;
const MAX_EMPTY_HINTS = 3;
const MAX_HISTORY = 200;
const MAX_CMD_HISTORY = 50;

export function useTerminalSession(scrollToBottom: () => void) {
  const isInteractive = ref(false);
  const inputValue = ref('');
  const outputHistory = ref<HistoryEntry[]>([]);
  const cmdHistory = ref<string[]>([]);
  const cmdHistoryIndex = ref(-1);
  const emptyEnterCount = ref(0);

  function pushHistory(entry: HistoryEntry) {
    outputHistory.value.push(entry);
    if (outputHistory.value.length > MAX_HISTORY) {
      outputHistory.value.shift();
    }
  }

  function clearHistory() {
    outputHistory.value = [];
    emptyEnterCount.value = 0;
  }

  function enter() {
    isInteractive.value = true;
    if (outputHistory.value.length === 0) {
      pushHistory({ output: WELCOME_OUTPUT, type: 'info' });
    }
  }

  function exit() {
    isInteractive.value = false;
    inputValue.value = '';
    cmdHistoryIndex.value = -1;
  }

  function addToCmd(raw: string) {
    if (raw !== cmdHistory.value[0]) {
      cmdHistory.value.unshift(raw);
      if (cmdHistory.value.length > MAX_CMD_HISTORY) {
        cmdHistory.value.pop();
      }
    }
  }

  async function askAI(raw: string, question: string) {
    if (question.length > MAX_QUESTION_LENGTH) {
      pushHistory({
        command: raw,
        output: `question too long (max ${MAX_QUESTION_LENGTH} chars)`,
        type: 'error',
      });
      await nextTick();
      scrollToBottom();
      return;
    }

    addToCmd(raw);

    const idx = outputHistory.value.length;
    pushHistory({ command: raw, output: 'thinking...', type: 'info' });
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
        output = 'rate limit reached. try again in a few minutes.';
        type = 'error';
      } else if (res.status === 503) {
        output = 'AI is temporarily unavailable. try again later.';
        type = 'error';
      } else if (!res.ok) {
        output = 'connection error. try again later.';
        type = 'error';
      } else {
        const data = (await res.json()) as { answer: string; contact?: boolean };
        output = data.answer;
        type = 'info';
        if (data.contact) {
          outputHistory.value[idx] = { command: raw, output, type, contactLink: '/contact' };
          await nextTick();
          scrollToBottom();
          return;
        }
      }
      outputHistory.value[idx] = { command: raw, output, type };
    } catch {
      outputHistory.value[idx] = {
        command: raw,
        output: 'connection error. try again later.',
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

    if (raw === '') {
      if (emptyEnterCount.value < MAX_EMPTY_HINTS) {
        emptyEnterCount.value++;
        pushHistory({ command: '', output: "ask me something, or type 'help' for tips", type: 'info' });
        await nextTick();
        scrollToBottom();
      }
      return;
    }

    const lower = raw.toLowerCase();

    if (lower === 'clear') {
      clearHistory();
      await nextTick();
      return;
    }

    if (lower === 'help') {
      addToCmd(raw);
      pushHistory({ command: raw, output: HELP_OUTPUT, type: 'info' });
      await nextTick();
      scrollToBottom();
      return;
    }

    if (lower === 'ask') {
      pushHistory({
        command: raw,
        output: 'usage: ask [question] — or just type directly',
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
    clearHistory,
    navigateHistory,
  };
}
