<script setup>
import { toRefs } from 'vue';

const defineProps = defineProps({
  size: {
    type: [String, Number],
    default: 14
  }
});

const { size } = toRefs(defineProps);
</script>

<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="`0 0 ${size} ${size}`"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.99984 1.16602V12.8327M1.1665 6.99935H12.8332"
      stroke="white"
      stroke-width="1.67"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
