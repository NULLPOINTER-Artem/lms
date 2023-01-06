import { ref } from "vue";

export default function useDebounce(callback, delay) {
  const timer = ref(null);

  const debouncedCallback = (...args) => {
    if (timer.value) clearTimeout(timer.value);
    timer.value = setTimeout(() => callback(...args), delay);
  };

  return debouncedCallback;
}
