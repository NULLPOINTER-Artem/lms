<script setup>
import { defineProps, onMounted, defineEmits, ref } from 'vue';

// Component-icons
import RoundedAddIcon from './icons/RoundedAddIcon.vue';

// Helpers
import getParentElementWithClass from '../helpers/getParentElementWithClass.js';

const props = defineProps({
  getRef: {
    type: Function,
    default: () => {}
  }
});
const emit = defineEmits(['open', 'close']);

// State
const wrapper = ref(null);

onMounted(() => {
  props.getRef(wrapper.value);
});

function onClick(e) {
  const parent = getParentElementWithClass(e.target, 'btn-add');

  if (parent.hasAttribute('data-opened')) {
    parent.removeAttribute('data-opened');
    emit('close');
  } else {
    parent.setAttribute('data-opened', true);
    emit('open');
  }
}
</script>

<template>
  <button ref="wrapper" class="btn-add" @click="onClick($event)">
    <RoundedAddIcon />
  </button>
</template>

<style lang="scss">
.btn-add {
  background: transparent;
  display: none;
  position: absolute;
  inset: unset !important;
  width: 32px;
  height: 32px;

  &[data-opened] {
    svg {
      transform: translateY(-50%) rotate(135deg);
    }
  }

  svg {
    position: absolute;
    left: 0;
    display: inline-block;
    transition: transform .2s ease-out, opacity .2s ease-out;
    transform: translateY(-50%);
    color: rgba(66, 72, 78, 0.72);
  }
}
</style>
