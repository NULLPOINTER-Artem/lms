<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useClientHandle } from '@urql/vue';

// Hooks
import useProgress from '../hooks/useProgress';
import useParseLearningPath from '../hooks/useParseLearningPath.js';

// API
import {
  queryCourseForUserBody,
} from '../API/queryBodies.js';

// Components
import ProgressBar from '../components/ProgressBar.vue';
import ArrowIcon from '../components/icons/ArrowIcon.vue';

// Global
const route = useRoute();
const router = useRouter();
const handleClient = useClientHandle();

// Hooks
const { getAllProgress } = useProgress();
const { parseCourseForLP } = useParseLearningPath();

// State
const currentCourse = ref({});

const queryCourseForUserVariables = {
  project_id: localStorage.getItem('project_id'),
  course_id: ''
}
const queryCourseForUser = handleClient.useQuery({
  query: queryCourseForUserBody,
  pause: true,
  variables: queryCourseForUserVariables,
  context: {
    requestPolicy: 'network-only'
  }
});

onMounted(async () => {
  queryCourseForUserVariables.project_id = localStorage.getItem('project_id');
  queryCourseForUserVariables.course_id = route.params.id;

  const response = await queryCourseForUser.executeQuery();

  if (response.data.value) {
    currentCourse.value = parseCourseForLP(response.data.value.entries_get.entries[0]);
    for await (const section of currentCourse.value.sections) await addSection(section);
  }
});

async function addSection(section) {
  const lesson_ids = section.lessons.map((lesson) => lesson.id);
  const lessons_progress = await getAllProgress(lesson_ids);

  section.lessons.forEach((lesson) => {
    if (lesson.id in lessons_progress) lesson.progress = lessons_progress[lesson.id];
  });

  section.opened = false;
}

function onSelectLesson(item) {
  router.push({
    name: 'lessonView',
    params: {
      id: item.id
    }
  });
}

function onToggleLessonsList(sectionItem) {
  sectionItem.opened = !sectionItem.opened;
}
</script>

<template>
  <div class="course-view">
    <div class="course-view__heading">
      <div class="course-view__heading-name">
        {{ currentCourse.name }}
      </div>
      <div class="course-view__heading-tools">
        <button type="button" class="course-view__heading-btn course-view__heading-btn--active">
          Outline
        </button>
        <button type="button" class="course-view__heading-btn">
          About Course
        </button>
      </div>
    </div>
    <div class="course-view__container">
      <div class="course-view__section-list">
        <div
          class="course-view__section-item"
          v-for="sectionItem of currentCourse.sections"
          :key="sectionItem.id"
        >
          <div class="course-view__section-item__heading">
            <div class="course-view__section-item__heading-container">
              <div class="course-view__section-item__info">
                <div class="course-view__section-item__name">
                  {{ sectionItem.name }}
                  <span class="course-view__section-item__count-lessons">
                    {{ sectionItem.count_lessons }} lessons
                  </span>
                </div>
                <div class="course-view__section-item__description">
                  {{ sectionItem.description }}
                </div>
              </div>
              <button
                v-if="sectionItem.lessons.length"
                :class="['course-view__section-arrow',
                         {'course-view__section-arrow--opened': sectionItem.opened}
                ]"
                @click="onToggleLessonsList(sectionItem)"
              >
                <ArrowIcon />
              </button>
            </div>
          </div>
          <div class="course-view__section-item__container">
            <div
              v-show="sectionItem.opened"
              class="course-view__page-list"
            >
              <div
                class="course-view__page-item"
                v-for="lesson of sectionItem.lessons"
                :key="lesson.id"
                @click="onSelectLesson(lesson)"
              >
                <div class="course-view__page-item__container">
                  <div class="course-view__page-item__part">
                    <div class="course-view__page-item__name">
                      {{ lesson.name }}
                    </div>
                    <div v-if="lesson.description" class="course-view__page-item__description">
                      {{ lesson.description }}
                    </div>
                  </div>
                  <div class="course-view__page-item__part">
                    <ProgressBar
                      :percent="lesson.progress"
                      :size="70"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.course-view {
  background-color: #eff2f5;
  padding: 20px 40px;
  min-height: 100vh;

  &__heading {
    margin-bottom: 25px;

    &-name {
      margin-bottom: 20px;
      color: #0B243D;
      font-weight: 700;
      font-size: 24px;
    }

    &-tools {
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }

    &-btn {
      margin-right: 15px;
      padding: 10px 30px;
      color: #101828;
      background-color: #fff;
      border-radius: 10px;
      border: 1px solid #D0D5DD;

      &--active {
        background: #358DE8;
        color: #fff;
      }
    }
  }

  &__container {
    padding-bottom: 25px;
  }

  &__section-list {}

  &__section-item {
    position: relative;
    margin-bottom: 20px;
    background-color: #fff;
    border-radius: 10px;

    &__heading {
      &-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 25px 30px;
      }
    }

    &__info {}

    &__name {
      color: #0B243D;
      font-weight: 700;
      font-size: 16px;
      margin-bottom: 10px;
    }

    &__count-lessons {
      padding-left: 9px;
      font-weight: 500;
      font-size: 16px;
      color: #A6B2C1;
    }

    &__description {
      font-weight: 400;
      font-size: 14px;
      color: #475467;
    }

    &__container {}
  }

  &__section-arrow {
    background: transparent;
    display: block;
    transform: rotate(180deg);
    transition: all 0.4s;

    &--opened {
      transform: rotate(0);
    }
  }

  &__page-list {}

  &__page-item {
    cursor: pointer;
    border-bottom: 1px solid #EAECF0;

    &:first-child {
      border-top: 1px solid #EAECF0;
    }

    &:last-child {
      border-bottom: 0;
    }

    &:hover {
      background-color: rgb(250, 250, 250);
    }

    &__container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 25px 30px;
    }

    &__part {}

    &__name {
      font-weight: 700;
      font-size: 14px;
      color: #0B243D;
      margin-bottom: 10px;
    }

    &__description {
      font-weight: 400;
      font-size: 14px;
      color: #475467;
    }
  }
}
</style>
