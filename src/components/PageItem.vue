<script setup>
import { defineProps, defineEmits, ref } from 'vue';
import { storeToRefs } from 'pinia';

// Store
import { roles, useUser } from '../stores/user.js';

// Components
import ProgressBar from './ProgressBar.vue';
import HamburgerMenuIcon from './icons/HamburgerMenuIcon.vue';
import OptionsMenu from './OptionsMenu.vue';

const props = defineProps({
  page: {
    type: Object,
    required: true
  }
});
const emit = defineEmits([
  'toggleMenu',
  'delete-page'
]);

// Store Refs
const { role } = storeToRefs(useUser());
const optionsMenuOpened = ref(false);

function toggleMenu(options) {
  const { event } = options;
  event.stopPropagation();
  optionsMenuOpened.value = !optionsMenuOpened.value;

  emit('toggleMenu', options);
}

function onDelete(options) {
  emit('delete-page', options);
}
</script>

<template>
  <div :class="['page__item', { 'page__item-selected': props.page.selected }]">
    <div class="page__item-icon">
      <ProgressBar
        v-if="role === roles.USER"
        :percent="props.page.viewed"
        :size="20"
        :inner-bg-color-on-complete="'#358DE8'"
        :complete-icon="{
          strokeColor: '#fff',
          strokeWidth: '5',
          width: '10',
          height: '10',
          viewBox: '0 0 32 32'
        }"
        :show-text="false"
      />
      <HamburgerMenuIcon v-else />
    </div>
    <div class="page__item-label">
      {{ props.page.title }}
    </div>
    <OptionsMenu
      v-if="role !== roles.USER"
      :class="{'options-menu-opened': optionsMenuOpened}"
      :item="props.page"
      :config="{
        edit: {
          show: false
        },
        delete: {
          text: 'Remove',
          show: true,
        },
        popperOffset: [60, 0]
      }"
      @delete="onDelete"
      @open-menu="toggleMenu"
    />
  </div>
</template>

<style lang="scss">
.page__item {
  position: relative;
  padding: 18px 30px 17px 53px;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
  transition: background .15s ease-out, color .15s ease-out, box-shadow .15s ease-out;

  cursor: pointer;

  &[draggable="true"] {
    cursor: grabbing;
  }

  &-selected {
    background-color: #F2F4F7;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 5px;
      background-color: #0B243D;
      border-radius: 0px 10px 10px 0px;
    }
  }

  &:hover {
    .options-menu {
      visibility: visible;
      z-index: 1;
    }
  }

  &-icon {
    position: absolute;
    left: 25px;
    top: 50%;
    transform: translateY(-50%);
  }

  &-label {
    color: #0B243D;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: -webkit-box;
    white-space: normal;
    -webkit-box-orient: vertical;
    overflow-wrap: anywhere;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.5;
    max-height: 44px;
    letter-spacing: -.2px;
    word-wrap: break-word;
    word-break: break-word;
  }

  .options-menu {
    padding: 0 9px;
    height: 40px;
    cursor: pointer;
    position: absolute;
    top: 50%;
    right: 13px;
    transform: translateY(-50%);
    border-color: transparent;
    background: none;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    min-width: 0;
    visibility: hidden;
    user-select: none;
    transition: background .15s ease, color .15s ease, box-shadow .15s ease, border-color .15s ease, opacity .15s ease;
    border-width: 1px;
    border-style: solid;
    border-radius: 6px;
    outline: none;
    will-change: opacity;

    &-opened {
      visibility: visible;
      z-index: 1;
    }
  }
}
</style>
