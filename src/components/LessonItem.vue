<script setup>
import { defineProps, onMounted, ref, defineEmits, triggerRef } from 'vue';
import { useRouter } from 'vue-router';
import { useClientHandle } from '@urql/vue';

// Helpers
import getParentElementWithClass from '../helpers/getParentElementWithClass.js';

// Hooks
import useDebounce from '../hooks/useDebounce.js';
import useParseLesson from '../hooks/useParseLesson.js';

// API
import {
  mutationUpdateLessonNameAndDescriptionBody
} from '../API/mutationBodies.js';

// Component-icons
import DraggableIcon from './icons/DraggableIcon.vue';
import FileIcon from './icons/FileIcon.vue';
import OptionsMenu from './OptionsMenu.vue';

const emit = defineEmits(['lesson-updated', 'delete-lesson']);
const props = defineProps({
  lesson: {
    type: Object,
    required: true
  },
  hookDeleteLesson: {
    type: Function,
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
const handleClient = useClientHandle();

// Hooks
const { parseLesson } = useParseLesson();

// State
const currentLessonItem = ref({});

const mutationUpdateLessonNameAndDescription = handleClient
  .useMutation(mutationUpdateLessonNameAndDescriptionBody);

onMounted(() => {
  currentLessonItem.value = {
    name: props.lesson.name,
    description: props.lesson.description
  }
});

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

async function onDelete({ item, menuOptions, menuItem, refOnShallowRef }) {
  menuItem.load = true;
  triggerRef(refOnShallowRef);

  if (props.hasParentController) emit('delete-lesson', item.value);

  await props.hookDeleteLesson(item.value);

  menuItem.load = false;
  triggerRef(refOnShallowRef);
  menuOptions.style.display = 'none';
}

function onEdit({ item, menuItem, refOnShallowRef }) {
  menuItem.load = true;
  triggerRef(refOnShallowRef);

  router.push({ path: `/lms/lessons/${item.value.id}/edit` }).then(() => {
    menuItem.load = false;
    triggerRef(refOnShallowRef);
  });
}

function updateLesson() {
  mutationUpdateLessonNameAndDescription.executeMutation({
    project_id: localStorage.getItem('project_id'),
    lesson_id: props.lesson.id,
    lesson_name: currentLessonItem.value.name,
    lesson_description: currentLessonItem.value.description
  }).then((response) => emit('lesson-updated', parseLesson(response.data.entries_update[0])));
}

const debouncedChangeLesson = useDebounce(updateLesson, 1000);
function onInputLessonName(event) {
  currentLessonItem.value.name = event.target.textContent;
  debouncedChangeLesson();
}
function onInputLessonDescription(event) {
  currentLessonItem.value.description = event.target.textContent;
  debouncedChangeLesson();
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
          <div
            class="material-item__info-name"
            contenteditable="true"
            @input="onInputLessonName"
          >
            {{ currentLessonItem.name }}
          </div>
          <div
            class="material-item__info-description"
            data-placeholder="Type description..."
            contenteditable="true"
            @input="onInputLessonDescription"
          >
            {{ currentLessonItem.description }}
          </div>
        </div>
      </div>
      <OptionsMenu
        v-if="props.hasActionBar"
        :item="props.lesson"
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
