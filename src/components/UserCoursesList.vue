<script setup>
import { defineProps, defineEmits } from 'vue';
import UserCoursesItem from "./UserCoursesItem.vue";

const emit = defineEmits(['select-course']);
const props = defineProps({
  courses: {
    type: Array,
    required: true
  }
});

function onSelectCourse(course) {
  emit('select-course', course);
}
</script>

<template>
  <div>
    <UserCoursesItem
      v-for="course of props.courses"
      :key="course.id"
      :course="course"
      @select-course="onSelectCourse"
    />
  </div>
</template>
