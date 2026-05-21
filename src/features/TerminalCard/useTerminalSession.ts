import { ref, nextTick } from 'vue';
import { runCommand } from './commands';

export type HistoryEntry = {
  command: string;
  output: string;
  type: 'info' | 'error' | 'success';
};

export function useTerminalSession(scrollToBottom: () => void) {
  const isInteractive = ref(false);
  const inputValue = ref('');
  const outputHistory = ref<HistoryEntry[]>([]);
  const cmdHistory = ref<string[]>([]);
  const cmdHistoryIndex = ref(-1);

  function enter() {
    isInteractive.value = true;
  }

  function exit() {
    isInteractive.value = false;
    inputValue.value = '';
    cmdHistoryIndex.value = -1;
  }

  async function execute() {
    const raw = inputValue.value.trim();
    inputValue.value = '';
    cmdHistoryIndex.value = -1;

    if (raw === '') return;

    if (raw.toLowerCase() === 'exit') {
      exit();
      await nextTick();
      return;
    }

    if (raw.toLowerCase() === 'clear') {
      outputHistory.value = [];
      await nextTick();
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
