<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

const timeouts: ReturnType<typeof setTimeout>[] = [];

onMounted(() => {
  const pres = document.querySelectorAll<HTMLPreElement>('.prose pre');

  pres.forEach((pre) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'code-wrapper';
    pre.parentNode?.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    const btn = document.createElement('button');
    btn.className = 'code-copy-btn';
    btn.textContent = 'Copy';
    btn.setAttribute('aria-label', 'Copy code to clipboard');
    wrapper.appendChild(btn);

    btn.addEventListener('click', () => {
      const text = pre.querySelector('code')?.textContent ?? '';
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        const id = setTimeout(() => {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 2000);
        timeouts.push(id);
      });
    });
  });
});

onUnmounted(() => {
  timeouts.forEach(clearTimeout);
});
</script>
