<script setup>
import { defineEmits, defineProps } from 'vue';

const emit = defineEmits(['closeWindow']);
const props = defineProps({
  showClose: {
    type: Boolean,
    default: true
  },
  classStyleContainer: {
    type: String,
    default: ''
  },
  classStyleWindow: {
    type: String,
    default: ''
  }
});

function onClose() {
  emit('closeWindow');
}
</script>

<template>
  <teleport to=".top-placement">
    <div
      :class="['modal-window', props.classStyleWindow]"
      @click.self="onClose"
    >
      <div :class="['modal-window__container', props.classStyleContainer]">
        <slot />
        <button
          v-if="props.showClose"
          type="button"
          class="modal-window__btn"
          @click="onClose"
        >
          <i class="bi bi-x" />
        </button>
      </div>
    </div>
  </teleport>
</template>

<style lang="scss">
.modal-window {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, .25);
  cursor: pointer;

  &__container {
    position: relative;
    cursor: default;
    height: 100%;
    max-height: 600px;
    max-width: 1200px;
    width: 100%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 2em;
    border-radius: 6px;
    background-color: #fff;
    box-shadow: 0 5px 15px 0 rgb(0 0 0 / 5%);
    overflow: auto;
  }

  &__btn {
    background: transparent;
    position: absolute;
    right: 15px;
    top: 10px;

    .bi {
      font-size: 21px;
    }

    &:hover {
      transform: scale(1.3);
    }
  }
}
</style>
