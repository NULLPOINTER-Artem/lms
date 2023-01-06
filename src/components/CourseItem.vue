<script setup>
import { defineProps, defineEmits, triggerRef } from 'vue';
import { useRouter } from 'vue-router';

// Helpers
import getParentElementWithClass from '../helpers/getParentElementWithClass.js';

// Component-icons
import DraggableIcon from './icons/DraggableIcon.vue';
import FileIcon from './icons/FileIcon.vue';
import OptionsMenu from './OptionsMenu.vue';

const emit = defineEmits(['delete-course']);
const props = defineProps({
  course: {
    type: Object,
    required: true
  },
  hasParentController: {
    type: Boolean,
    default: false
  },
  hasActionBar: {
    type: Boolean,
    default: true
  },
  isDraggable: {
    type: Boolean,
    default: true
  },
});

// Global
const router = useRouter();

function onOpenOptions({ event, menuOptions, popperItem, generateGetBoundingClientRect }) {
  if (menuOptions.style.display !== 'block') {
    const btn_options = getParentElementWithClass(event.target, 'options-menu__btn');

    const rect = btn_options.getBoundingClientRect();
    popperItem.virtualTarget.getBoundingClientRect = generateGetBoundingClientRect(rect.x, rect.y);

    popperItem.instance.update();
    menuOptions.style.display = 'block';
  } else {
    menuOptions.style.display = 'none';
  }
}

async function onDelete(options) {
  if (props.hasParentController) emit('delete-course', options);
}

function onEdit({ item, menuItem, refOnShallowRef }) {
  menuItem.load = true;
  triggerRef(refOnShallowRef);

  router.push({ path: `/lms/courses/${item.value.id}/edit` }).then(() => {
    menuItem.load = false;
    triggerRef(refOnShallowRef);
  });
}
</script>

<template>
  <div class="material-item">
    <div v-if="props.isDraggable" class="material-item__drag-icon">
      <DraggableIcon />
    </div>
    <div class="material-item__container">
      <div class="material-item__info">
        <div class="material-item__info-icon">
          <FileIcon />
        </div>
        <div class="material-item__info-block">
          <div class="material-item__info-name">
            {{ course.name }}
          </div>
          <div v-if="course.description" class="material-item__info-description">
            {{ course.description }}
          </div>
        </div>
      </div>
      <OptionsMenu
        v-if="props.hasActionBar"
        :item="props.course"
        @edit="onEdit"
        @delete="onDelete"
        @open-menu="onOpenOptions"
      />
    </div>
  </div>
</template>

<style lang="scss">
@import '../assets/css/components/material/material-item.scss';
</style>
