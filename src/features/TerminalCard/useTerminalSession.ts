import { ref, nextTick } from 'vue';
import { runCommand } from './commands';

export type HistoryEntry = {
  command: string;
  output: string;
  type: 'info' | 'error' | 'success';
};

type InterviewState = {
  active: boolean;
  step: number;
};

const INTERVIEW_QUESTIONS = [
  'Q 1/4: Describe your main stack in one sentence.',
  "Q 2/4: What's your approach to legacy code?",
  'Q 3/4: Vue 3 or React? (no wrong answers)',
  'Q 4/4: One word to describe yourself as an engineer.',
];

export function useTerminalSession(scrollToBottom: () => void) {
  const isInteractive = ref(false);
  const inputValue = ref('');
  const outputHistory = ref<HistoryEntry[]>([]);
  const cmdHistory = ref<string[]>([]);
  const cmdHistoryIndex = ref(-1);
  const interviewState = ref<InterviewState>({ active: false, step: 0 });

  function enter() {
    isInteractive.value = true;
  }

  function exit() {
    isInteractive.value = false;
    inputValue.value = '';
    cmdHistoryIndex.value = -1;
    interviewState.value = { active: false, step: 0 };
  }

  async function advanceInterview(answer: string) {
    const step = interviewState.value.step;

    if (step < INTERVIEW_QUESTIONS.length - 1) {
      interviewState.value.step++;
      const nextQ = INTERVIEW_QUESTIONS[step + 1] ?? '';
      outputHistory.value.push({
        command: answer,
        output: `  [noted]\n\n  ${nextQ}`,
        type: 'info',
      });
    } else {
      interviewState.value = { active: false, step: 0 };
      outputHistory.value.push({
        command: answer,
        output:
          '  [noted]\n\n  Interview complete. Strong candidate.\n  Advancing to next round.\n  ...just kidding — but reach me at /contact',
        type: 'success',
      });
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
      interviewState.value = { active: false, step: 0 };
      await nextTick();
      return;
    }

    if (interviewState.value.active) {
      await advanceInterview(raw);
      return;
    }

    if (lower === 'ask' || lower.startsWith('ask ')) {
      const question = raw.slice(4).trim();

      if (!question) {
        outputHistory.value.push({
          command: raw,
          output: '  usage: ask [your question]',
          type: 'error',
        });
        await nextTick();
        scrollToBottom();
        return;
      }

      if (question.length > 200) {
        outputHistory.value.push({
          command: raw,
          output: '  question too long (max 200 chars)',
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
      return;
    }

    if (lower === 'interview') {
      if (raw !== cmdHistory.value[0]) cmdHistory.value.unshift(raw);
      outputHistory.value.push({
        command: raw,
        output: [
          '  Starting interview session...',
          '  Type your answers and press Enter.',
          '',
          `  ${INTERVIEW_QUESTIONS[0] ?? ''}`,
        ].join('\n'),
        type: 'info',
      });
      interviewState.value = { active: true, step: 0 };
      await nextTick();
      scrollToBottom();
      return;
    }

    const result = runCommand(raw);

    if (raw !== cmdHistory.value[0]) {
      cmdHistory.value.unshift(raw);
    }

    outputHistory.value.push({
      command: raw,
      output: result.output,
      type: result.type,
    });

    await nextTick();
    scrollToBottom();
  }

  function navigateHistory(direction: -1 | 1) {
    const len = cmdHistory.value.length;
    if (len === 0) return;

    // ArrowUp (direction=-1) → older command = higher index; ArrowDown (direction=1) → newer = lower
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
