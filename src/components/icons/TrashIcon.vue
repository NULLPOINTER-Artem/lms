<script setup>
import { toRefs } from 'vue';

const defineProps = defineProps({
  iconOptions: {
    type: Object,
    default: () => ({
      strokeColor: '#F04438',
      strokeWidth: '1.375',
      width: '22',
      height: '22',
      viewBox: '0 0 22 22'
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
      d="M4.62975 8.00633C3.85525 6.97366 4.59208 5.5 5.88291 5.5H16.1171C17.4079 5.5 18.1448 6.97366 17.3703 8.00633V8.00633C16.8054 8.75952 16.5 9.6756 16.5 10.6171V16.1667C16.5 18.3758 14.7091 20.1667 12.5 20.1667H9.5C7.29086 20.1667 5.5 18.3758 5.5 16.1667V10.6171C5.5 9.6756 5.19464 8.75952 4.62975 8.00633V8.00633Z"
      :stroke="iconOptions.strokeColor"
      :stroke-width="iconOptions.strokeWidth"
    />
    <path
      d="M12.8335 15.584L12.8335 10.084"
      :stroke="iconOptions.strokeColor"
      :stroke-width="iconOptions.strokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M9.1665 15.584L9.1665 10.084"
      :stroke="iconOptions.strokeColor"
      :stroke-width="iconOptions.strokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M14.6668 5.5L14.206 4.11754C13.9338 3.30086 13.1695 2.75 12.3086 2.75H9.69168C8.83082 2.75 8.06654 3.30086 7.79431 4.11754L7.3335 5.5"
      :stroke="iconOptions.strokeColor"
      :stroke-width="iconOptions.strokeWidth"
      stroke-linecap="round"
    />
  </svg>
</template>
