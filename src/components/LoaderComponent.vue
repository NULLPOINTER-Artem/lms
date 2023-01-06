<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  load: {
    type: Boolean,
    required: true
  }
});
</script>

<template>
  <div v-if="props.load" class="loader" />
</template>

<style lang="scss">
.loader {
  top: 5px;
  right: 41.4%;
  position: relative;

  border-top: 1.1em solid rgba(0, 0, 0, 0.2);
  border-right: 1.1em solid rgba(0, 0, 0, 0.2);
  border-bottom: 1.1em solid rgba(0, 0, 0, 0.2);
  border-left: 1.1em solid #000000;

  font-size: 2px;
  border-radius: 50%;
  width: 17px;
  height: 17px;

  transform: translateZ(0);
  animation: load8 1.1s infinite linear;
}

@keyframes load8 {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }

  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
</style>
