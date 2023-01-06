<script setup>
import { shallowRef, defineEmits, toRefs, ref, onMounted } from 'vue';

// Hooks
import usePopper from '../hooks/usePopper.js';

// Components
import Loader from './LoaderComponent.vue';
import OptionsIcon from './icons/OptionsIcon.vue';
import EditIcon from './icons/EditIcon.vue';
import TrashIcon from './icons/TrashIcon.vue';

const emit = defineEmits(['edit', 'delete', 'open-menu']);
const defineProps = defineProps({
  item: {
    type: Object,
    required: true
  },
  config: {
    type: Object,
    default: () => ({
      edit: {
        show: true,
        text: 'Edit'
      },
      delete: {
        show: true,
        text: 'Delete'
      },
      popperOffset: [10, 30]
    })
  }
});
// Props Refs
const { item, config } = toRefs(defineProps);

// Hooks
const { getPopper, addPopper, generateGetBoundingClientRect } = usePopper();

// State
const optionMenuItems = shallowRef([
  {
    id: 1,
    text: config.value.edit.text,
    icon: EditIcon,
    load: false,
    show: config.value.edit.show,
    handler: onEdit
  },
  {
    id: 2,
    text: config.value.delete.text,
    icon: TrashIcon,
    load: false,
    show: config.value.delete.show,
    handler: onDelete
  },
]);
const menuOptions = ref(null);

onMounted(() => {
  addPopper('menuOptions', {
    virtualTarget: {
      getBoundingClientRect: generateGetBoundingClientRect()
    },
    popperEl: menuOptions.value,
    options: {
      placement: 'left',
      modifiers: [
        {
          name: 'computeStyles',
          options: {
            gpuAcceleration: false
          },
        },
        {
          name: 'eventListeners',
          options: {
            scroll: false,
          }
        },
        {
          name: 'offset',
          options: {
            offset: config.value.popperOffset,
          },
        }
      ],
    }
  });
});

function onEdit(event, menuItem) {
  event.stopPropagation();

  emit('edit', {
    item,
    menuItem,
    menuOptions: menuOptions.value,
    refOnShallowRef: optionMenuItems
  });
}

function onDelete(event, menuItem) {
  event.stopPropagation();

  emit('delete', {
    item,
    menuItem,
    menuOptions: menuOptions.value,
    refOnShallowRef: optionMenuItems
  });
}

function onOpenOptions(event) {
  event.stopPropagation();

  emit('open-menu', {
    event,
    item,
    menuOptions: menuOptions.value,
    popperItem: getPopper('menuOptions'),
    generateGetBoundingClientRect
  });
}
</script>

<template>
  <div class="options-menu">
    <div class="options-menu__container">
      <button
        class="options-menu__btn"
        type="button"
        @click="onOpenOptions"
      >
        <OptionsIcon />
      </button>
      <div ref="menuOptions" class="options-menu__list">
        <div
          :class="['options-menu__item', {'options-menu__item--disappear': !menuItem.show}]"
          v-for="menuItem of optionMenuItems"
          :key="menuItem.id"
          @click="menuItem.handler($event, menuItem)"
        >
          <div v-show="menuItem.show">
            <component v-if="!menuItem.load" class="options-menu__item-icon" :is="menuItem.icon" />
            <Loader :load="menuItem.load" />
            <span class="options-menu__item-text">{{ menuItem.text }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.options-menu {
  &__container {}

  &__btn {
    background: transparent;
  }

  &__list {
    display: none;
    padding: 10px 15px;
    border: 1px solid #D0D5DD;
    border-radius: 16px;
    background-color: #fff;
    min-width: 150px;
  }

  &__item {
    margin-bottom: 5px;
    padding: 7px;
    border-radius: 5px;
    cursor: pointer;
    text-align: left;

    &--disappear {
      padding: 0;
      margin: 0;
    }

    &:last-child {
      margin-bottom: 0;
    }

    &:hover {
      background-color: #F1F3F6;
    }

    .loader {
      display: inline-block;
      vertical-align: middle;
      margin-right: 7px;
      right: unset;
      left: unset;
      top: unset;
      bottom: unset;
      width: 20px;
      height: 20px;
    }

    &-icon {
      display: inline-block;
      vertical-align: middle;
      margin-right: 7px;
    }

    &-text {
      display: inline-block;
      vertical-align: middle;
    }
  }
}
</style>
