<script setup>
import { defineProps, defineEmits } from 'vue';
import ProgressBar from './ProgressBar.vue';

const emit = defineEmits(['select-course']);
const props = defineProps({
  course: {
    type: Object,
    required: true
  }
});

function onSelectCourse() {
  emit('select-course', props.course);
}
</script>

<template>
  <div
    class="user-courses-item"
    @click="onSelectCourse"
  >
    <div class="user-courses-item__container">
      <div class="user-courses-item__part">
        <div
          class="user-courses-item__thumbnail"
          :style="{backgroundImage: `url(${props.course.banner})`}"
        />
        <div class="user-courses-item__info">
          <div class="user-courses-item__name">
            {{ props.course.name }}
          </div>
          <div class="user-courses-item__inside">
            <span>{{ props.course.duration }} hours</span>
            <span>{{ props.course.count_lessons }} lessons</span>
          </div>
          <div v-show="props.course.description" class="user-courses-item__description">
            {{ props.course.description }}
          </div>
        </div>
      </div>
      <div class="user-courses-item__part">
        <ProgressBar
          :percent="props.course.progress"
          :size="106"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.user-courses-item {
  background: #FFFFFF;
  border-radius: 10px;
  padding: 35px 35px 0 35px;

  &:last-child {
    padding-bottom: 35px;
  }

  &__container {
    background: #F9FAFB;
    border: 1px solid #D0D5DD;
    border-radius: 10px;
    cursor: pointer;
    padding: 25px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__thumbnail {
    border-radius: 10px;
    margin-right: 30px;
    width: 200px;
    height: 120px;
    background-repeat: no-repeat;
    background-size: cover;
  }

  &__part {
    display: flex;
    align-items: center;
  }

  &__info {
    max-width: 60%;
  }

  &__description {
    font-weight: 500;
    font-size: 14px;
    color: #0B243D;
  }

  &__name {
    margin-bottom: 7px;
    font-weight: 700;
    font-size: 16px;
    color: #0B243D;
  }

  &__inside {
    color: #A6B2C1;
    font-weight: 500;
    font-size: 14px;
    margin-bottom: 8px;

    span {
      position: relative;
      padding-left: 14px;

      &::before {
        content: '';
        position: absolute;
        left: 5px;
        top: 50%;
        width: 5px;
        height: 5px;
        background-color: #A6B2C1;
        border-radius: 50%;
        transform: translateY(-50%);
      }

      &:first-child {
        padding-left: unset;

        &::before {
          content: none;
        }
      }
    }
  }
}
</style>
