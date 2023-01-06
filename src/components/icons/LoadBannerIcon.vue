<script setup>
import { toRefs } from 'vue';

const defineProps = defineProps({
  iconOptions: {
    type: Object,
    default: () => ({
      color: '#000'
    })
  }
});

const { iconOptions } = toRefs(defineProps);
</script>

<template>
  <svg viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
      <path
        id="a"
        d="M2 11.869l4.437-4.56a1.023 1.023 0 011.467 0l3.876 3.984 1.316-1.352a1.023 1.023 0 011.467 0L19 14.501V3.07c0-.566-.448-1.024-1-1.024H3c-.552 0-1 .458-1 1.024v8.798zm0 2.94v3.12c0 .565.448 1.023 1 1.023h15c.552 0 1-.458 1-1.024v-.487l-5.17-5.313-1.316 1.351a1.023 1.023 0 01-1.467 0L7.171 9.496 2 14.809zm19 2.164v.955C21 19.624 19.657 21 18 21H3c-1.657 0-3-1.375-3-3.07V3.07C0 1.374 1.343-.001 3-.001h15c1.657 0 3 1.375 3 3.072v13.902zM15.5 8a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"
      />
    </defs>
    <g fill="none" fill-rule="evenodd">
      <mask id="b" fill="#fff">
        <use xlink:href="#a" />
      </mask>
      <g :fill="iconOptions.color" fill-rule="nonzero" mask="url(#b)"><path d="M-1-1h24v24H-1z" /></g>
    </g>
  </svg>
</template>
