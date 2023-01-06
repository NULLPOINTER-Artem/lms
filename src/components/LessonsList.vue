<script setup>
import { defineProps, ref, watch, defineEmits, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useClientHandle } from '@urql/vue';

// Store
import { roles, useUser } from '../stores/user.js';

// Hooks
import usePagesDeletion from '../hooks/usePagesDeletion.js';

// Helpers
import getParentElementWithClass from '../helpers/getParentElementWithClass.js';

// API
import {
  mutationUpdateLessonOrderIdBody,
} from '../API/mutationBodies.js';

// Components
import LessonItem from './LessonItem.vue';

const emit = defineEmits(['lesson-updated', 'select-lesson', 'delete-lesson', 'list-updated']);
const props = defineProps({
  lessons: {
    type: Array,
    required: true
  },
  hasParentController: {
    type: Boolean,
    default: false
  },
  isDraggable: {
    type: Boolean,
    default: true
  },
  hasActionBar: {
    type: Boolean,
    default: true
  },
});

// Global
const handleClient = useClientHandle();

// Store Refs
const { role } = storeToRefs(useUser());

// Hooks
const { deleteLesson } = usePagesDeletion();

// State
const lessons = ref([]);

const mutationUpdateLessonOrderId = handleClient.useMutation(mutationUpdateLessonOrderIdBody);

onMounted(() => getLessons());

watch(() => props.lessons, () => getLessons());

async function getLessons() {
  lessons.value = [...props.lessons]
    .sort((a, b) => Number.parseInt(a.lesson_order_id) - Number.parseInt(b.lesson_order_id));
}

function onDrop(event) {
  const transferredLessonOrderId = event.dataTransfer.getData('lessonOrderId');
  const draggedLesson = lessons.value.find((lesson) => lesson.lesson_order_id === transferredLessonOrderId);
  const targetOrderIdOnDrop = getParentElementWithClass(event.target, 'material-item').dataset.lessonOrderId;
  const foundTargetLesson = lessons.value.find((lesson) => lesson.lesson_order_id === targetOrderIdOnDrop);

  draggedLesson.lesson_order_id = targetOrderIdOnDrop;
  foundTargetLesson.lesson_order_id = transferredLessonOrderId;

  lessons.value.sort((a, b) => Number.parseInt(a.lesson_order_id) - Number.parseInt(b.lesson_order_id));

  emit('list-updated', lessons.value);

  mutationUpdateLessonOrderId.executeMutation({
    project_id: localStorage.getItem('project_id'),
    lesson_id: draggedLesson.id,
    lesson_order_id: String(draggedLesson.lesson_order_id)
  }).then(() => {
    mutationUpdateLessonOrderId.executeMutation({
      project_id: localStorage.getItem('project_id'),
      lesson_id: foundTargetLesson.id,
      lesson_order_id: String(foundTargetLesson.lesson_order_id)
    })
  });
}

function onStartDrag(event, lesson) {
  event.dataTransfer.dropEffect = 'move';
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('lessonOrderId', lesson.lesson_order_id);
}

function onUpdateLesson(updatedLesson) {
  emit('lesson-updated', updatedLesson);
}

function onSelectLesson(item) {
  emit('select-lesson', props.lessons.find((lesson) => lesson.id === item.id));
}

function onDeleteLesson(item) {
  emit('delete-lesson', props.lessons.find((lesson) => lesson.id === item.id));
}
</script>

<template>
  <div
    v-if="lessons.length"
    class="material-list"
    @drop="onDrop"
    @dragenter.prevent
    @dragover.prevent
  >
    <LessonItem
      v-for="lesson of lessons"
      :key="lesson.id"
      :lesson="lesson"
      :hook-delete-lesson="deleteLesson"
      :has-parent-controller="props.hasParentController"
      :draggable="role === roles.ADMIN && props.isDraggable"
      :has-action-bar="props.hasActionBar"
      :is-draggable="props.isDraggable"
      :data-lesson-order-id="lesson.lesson_order_id"
      @dragstart="onStartDrag($event, lesson)"
      @lesson-updated="onUpdateLesson"
      @delete-lesson="onDeleteLesson"
      @click="onSelectLesson(lesson)"
    />
  </div>
  <div v-else class="material-list--no-items">
    There are no lessons yet
  </div>
</template>

<style lang="scss">
@import '../assets/css/components/material/material-list.scss';
</style>
