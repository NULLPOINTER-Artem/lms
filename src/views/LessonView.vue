<script setup>
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';

// Hooks
import usePagesSidebar from '../hooks/usePagesSidebar.js';
import useEventEmitter from '../hooks/useEventEmitter.js';

// Components
import PagesSidebar from '../components/PagesSidebar.vue';

// Constants
const PRE_QUESTION_PERCENT = 2;

// Hooks
const { changeContent, insertQuizzesIntoContent, passContent } = usePagesSidebar();
const { getEmitter } = useEventEmitter();

// State
const currentContent = reactive({
  id: null,
  title: '',
  content: '',
  currentPageId: null,
  banner_data: null,
  chaptersInfo: {
    current: 1,
    length: 1
  },
  viewed: 0,
  quizzes: []
});
const hasPages = ref(false);
const lesson_name = ref('New Lesson');
const emitterInstance = getEmitter();
const questionsLength = ref(0);

onMounted(() => {
  emitterInstance.on('add-questions', onAddQuestions);
  emitterInstance.on('submit-question', onSubmitQuestion);
  emitterInstance.on('retry-question', onRetryQuestion);
});

onBeforeUnmount(() => {
  emitterInstance.off('add-questions', onAddQuestions);
  emitterInstance.off('submit-question', onSubmitQuestion);
  emitterInstance.off('retry-question', onRetryQuestion);
});

function onScrollLessonContainer(event) {
  calculatePercentViewed(event.target);
}

function calculatePercentViewed(element) {
  if (hasPages.value) {
    const scrollTop = element.scrollTop;
    const viewportHeight = window.innerHeight;
    const elementOffsetTop = element.offsetTop;
    const elementScrollHeight = element.scrollHeight;

    const distance = (scrollTop + viewportHeight) - elementOffsetTop;
    const percentage = Math.round(distance / (elementScrollHeight / 100));
    const currentView = Math.min(100, Math.max(0, percentage)) - (questionsLength.value * PRE_QUESTION_PERCENT);

    if (currentView > currentContent.viewed) currentContent.viewed = currentView;
  }
}

function findEmptyElements() {
  const content = document.querySelector('.editor-content');

  const allEmptyElements = content.querySelectorAll('.paragraph-edit-empty');

  for (const element of allEmptyElements) element.style.display = 'none';
}

function onChangeContent(data) {
  questionsLength.value = 0;

  if (!hasPages.value) hasPages.value = true;

  changeContent(data, currentContent);

  nextTick(() => {
    findEmptyElements();
    const lesson_container = document.querySelector('.lesson-view__container');
    calculatePercentViewed(lesson_container);
    insertQuizzesIntoContent(currentContent, '.editor-content');
  });
}

function setLessonName(name) {
  lesson_name.value = name;
}

function onAddQuestions(questions) {
  let counter = 0;

  // Count questions which are not answered
  for (const question of questions) {
    const user_answers = question.elements
      .find((element) => element.api_name.includes('element__question_answers__entry'))
      .value;

    // Check on exist answers
    if (!user_answers || !user_answers.length) {
      counter += 1;
    } else {
      // Other wise we need to make sure that the current user answered this question or not
      const current_user_id = localStorage.getItem('user_id');

      const foundAnswerByCurrUser = user_answers.find((answer) => {
        const user_id = answer.elements
          .find((element) => element.api_name.includes('element__user__user'))
          .value[0].id;

        return user_id === current_user_id;
      });

      if (!foundAnswerByCurrUser) counter += 1;
    }
  }

  questionsLength.value += counter;
  currentContent.viewed -= (counter * PRE_QUESTION_PERCENT);
}

function onSubmitQuestion() {
  questionsLength.value -= 1;
  currentContent.viewed += PRE_QUESTION_PERCENT;
}

function onRetryQuestion() {
  questionsLength.value += 1;
  currentContent.viewed -= PRE_QUESTION_PERCENT;
}
</script>

<template>
  <div class="lesson-view__heading">
    <div class="lesson-view__heading-label">
      {{ lesson_name }}
    </div>
  </div>
  <div class="lesson-view editor">
    <PagesSidebar
      :set-lesson-name="setLessonName"
      :pass-save-content="() => passContent(currentContent)"
      :current-content-viewed="currentContent.viewed"
      @change-page="onChangeContent"
    />
    <div v-if="hasPages" class="lesson-view__container" @scroll="onScrollLessonContainer">
      <div :class="['editor-header', {'editor-header-banner-loaded': currentContent.banner_data}]">
        <div v-show="currentContent.banner_data" class="editor-header__cover-container">
          <div class="cover-container__overlay" />
        </div>
        <div class="editor-header__title-container">
          <div class="editor-header__count">
            Chapter {{ currentContent.chaptersInfo.current }} of {{ currentContent.chaptersInfo.length }}
          </div>
          <h1
            class="editor-header__title"
          >
            {{ currentContent.title }}
          </h1>
        </div>
      </div>
      <div class="lesson-view__content editor-content" v-html="currentContent.content" />
    </div>
    <div v-else class="lesson-view__no-pages">
      The lesson has not pages yet
    </div>
  </div>
</template>

<style lang="scss">
@import '../assets/css/editor.scss';

.lesson-view {
  &__heading {
    padding: 20px;

    &-label {
      color: #0B243D;
      font-weight: 700;
      font-size: 24px;
      text-transform: capitalize;
    }
  }

  &__container {
    background-color: #fff;
    max-height: 75vh;
    min-height: 75vh;
    overflow-x: hidden;
    overflow-y: auto;

    -ms-overflow-style: none;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__content {}

  &__no-pages {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    color: #0B243D;
    background-color: #FCFCFD;
  }
}
</style>
