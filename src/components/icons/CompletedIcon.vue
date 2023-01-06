<script setup>
import { toRefs } from 'vue';

const defineProps = defineProps({
  iconOptions: {
    type: Object,
    default: () => ({
      strokeColor: '#358DE8',
      strokeWidth: '5',
      width: '32',
      height: '32',
      viewBox: '0 0 32 32'
    })
  }
});

const { iconOptions } = toRefs(defineProps);
</script>

<template>
  <svg
    :width="iconOptions.width"
    :height="iconOptions.height"
    :viewBox="iconOptions.viewBox"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5.5 14.5L12.5 21.5L26.5 6.5"
      :stroke="iconOptions.strokeColor"
      :stroke-width="iconOptions.strokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
