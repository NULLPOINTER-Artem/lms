<script setup>
import { defineProps, onMounted, ref, watch, defineEmits } from 'vue';
import { useRoute } from 'vue-router';

// Helpers
import getParentElementWithClass from '../helpers/getParentElementWithClass.js';

// Components
import CourseItem from './CourseItem.vue';

const emit = defineEmits(['select-course', 'delete-course', 'update-list']);
const props = defineProps({
  courses: {
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
const route = useRoute();

// State
let mappedCourses = ref([]);

onMounted(() => getCourses());

watch(() => props.courses, () => getCourses());

async function getCourses() {
  mappedCourses.value = props.isDraggable ?
      [...props.courses].sort((a, b) =>
        Number.parseInt(a.course_order[route.params.id]) - Number.parseInt(b.course_order[route.params.id]))
    :
      [...props.courses];
}

function onDrop(event) {
  const transferredCourseOrderId = event.dataTransfer.getData('course_order_id');
  const draggedCourse = mappedCourses.value.find(
    (course) =>
      Number.parseInt(course.course_order[route.params.id]) ===Number.parseInt(transferredCourseOrderId)
  );
  const targetOrderIdOnDrop = getParentElementWithClass(event.target, 'material-item').dataset.courseOrderId;
  const foundTargetCourse = mappedCourses.value.find(
    (course) => Number.parseInt(course.course_order[route.params.id]) === Number.parseInt(targetOrderIdOnDrop)
  );

  draggedCourse.course_order[route.params.id] = targetOrderIdOnDrop;
  foundTargetCourse.course_order[route.params.id] = transferredCourseOrderId;

  emit('update-list', mappedCourses.value);
}

function onStartDrag(event, course) {
  event.dataTransfer.dropEffect = 'move';
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('course_order_id', course.course_order[route.params.id]);
}

function onSelectCourse(item) {
  emit('select-course', item);
}

function onDeleteCourse(options) {
  emit('delete-course', options);
}
</script>

<template>
  <div
    v-if="mappedCourses.length"
    class="material-list"
    @drop="onDrop"
    @dragenter.prevent
    @dragover.prevent
  >
    <CourseItem
      v-for="course of mappedCourses"
      :key="course.id"
      :course="course"
      :draggable="props.isDraggable"
      :data-course-order-id="course.course_order[route.params.id] ?? 0"
      :has-parent-controller="props.hasParentController"
      :has-action-bar="props.hasActionBar"
      :is-draggable="props.isDraggable"
      @dragstart="onStartDrag($event, course)"
      @click="onSelectCourse(course)"
      @delete-course="onDeleteCourse"
    />
  </div>
  <div v-else class="material-list--no-items">
    There are no courses yet
  </div>
</template>

<style lang="scss">
@import '../assets/css/components/material/material-list.scss';
</style>
