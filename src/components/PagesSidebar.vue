<script setup>
import { reactive, defineEmits, defineProps, watch, ref, onMounted, triggerRef } from 'vue';
import { useRoute, onBeforeRouteLeave } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useClientHandle } from '@urql/vue';

// Store
import { roles, useUser } from '../stores/user.js';

// Helpers
import getParentElementWithClass from '../helpers/getParentElementWithClass.js';
import generateId from '../helpers/generateId.js';

// Hooks
import useProgress from '../hooks/useProgress.js';
import usePagesDeletion from '../hooks/usePagesDeletion.js';
import useParseLesson from '../hooks/useParseLesson.js';
import useParsQuiz from '../hooks/useParseQuiz.js';
import useQuizzesDeletion from '../hooks/useQuizzesDeletion.js';

// API
import {
  mutationUpdateLessonBody,
  mutationCreatePageBody,
  mutationUpdatePageBody,
  mutationUpdatePageOrderIdBody
} from '../API/mutationBodies.js';
import {
  queryLessonBody,
  queryQuizzesByIdsBody
} from '../API/queryBodies.js';
import { setElementValueInputEntry } from '../API/tools/common.js';

// Components
import PageItem from './PageItem.vue';
import AddIcon from './icons/AddIcon.vue';

const props = defineProps({
  currTitle: {
    type: String,
    default: ''
  },
  passSaveContent: {
    type: Function,
    default: () => {}
  },
  setLessonName: {
    type: Function,
    default: () => {}
  },
  setLessonCategories: {
    type: Function,
    default: () => {}
  },
  lessonName: {
    type: String,
    default: ''
  },
  setLessonEntryId: {
    type: Function,
    default: () => {}
  },
  currentContentViewed: {
    type: Number,
    default: 0
  }
});
const emit = defineEmits({
  addNewPage: () => {
    return true;
  },
  changePage: () => {
    return true;
  },
  noPages: () => {
    return true;
  }
});

// Global
const route = useRoute();
const handleClient = useClientHandle();

// Hooks
const { pagesDeletion } = usePagesDeletion();
const {
  updatePagesProgress,
  updateLessonProgress,
  getAllProgress,
  getProgress
} = useProgress();
const { parseLesson } = useParseLesson();
const { parseQuiz } = useParsQuiz();
const { deleteQuizzes } = useQuizzesDeletion();

// Store Refs
const { role } = storeToRefs(useUser());

// State
const lessonData = reactive({
  entry_id: null,
  complete: 0,
  pages: []
});
const currentLesson = ref({});

const mutationUpdateLesson = handleClient.useMutation(mutationUpdateLessonBody);

const mutationCreatePage = handleClient.useMutation(mutationCreatePageBody);
const mutationUpdatePage = handleClient.useMutation(mutationUpdatePageBody);
const mutationUpdatePageOrderId = handleClient.useMutation(mutationUpdatePageOrderIdBody);

const queryLessonVariables = {
  project_id: '',
  lesson_id: ''
};
const queryLesson = handleClient.useQuery({
  query: queryLessonBody,
  pause: true,
  variables: queryLessonVariables,
  context: {
    requestPolicy: 'network-only'
  }
});

const queryQuizzesByIdsVariables = {
  project_id: '',
  quiz_ids: ''
};
const queryQuizzesByIds = handleClient.useQuery({
  query: queryQuizzesByIdsBody,
  pause: true,
  variables: queryQuizzesByIdsVariables,
  context: {
    requestPolicy: 'network-only'
  }
});

onMounted(async () => {
  queryLessonVariables.project_id = localStorage.getItem('project_id');
  queryLessonVariables.lesson_id = route.params.id;
  const response_queryLessons = await queryLesson.executeQuery();

  currentLesson.value = parseLesson(response_queryLessons.data.value.entries_get.entries[0]);

  lessonData.entry_id = currentLesson.value.id;
  props.setLessonEntryId(lessonData.entry_id);

  if (role.value === roles.USER) lessonData.complete = await getProgress(lessonData.entry_id);

  props.setLessonName(currentLesson.value.name);

  const lesson_categories = currentLesson.value.elements
    .find((element) => element.api_name.includes('element__lesson_categories__entry')).value;
  props.setLessonCategories(lesson_categories);

  let pages = currentLesson.value.elements
    .find((element) => element.api_name.includes('element__lesson_pages__entry')).value;

  if (pages && pages.length) {
    pages = pages.map((page) => {
      const page_order_id = page.elements
        .find((element) => element.api_name.includes('element__page_order__text')).value;
      const banner_data = page.elements
        .find((element) => element.api_name.includes('element__page_banner__text')).value;
      const quizzes = page.elements
        .find((element) => element.api_name.includes('element__quizzes__entry')).value;

      return {
        ...page,
        page_order_id,
        banner_data,
        quizzes: quizzes ?? []
      }
    });

    pages.sort((a, b) => a.page_order_id - b.page_order_id);

    for await (const page of pages) await addPage(page);

    if (role.value === roles.USER) {
      const pagesProgress = await getAllProgress(lessonData.pages.map((page) => page.entry_id));

      lessonData.pages.forEach((page) => {
        if (page.entry_id in pagesProgress) page.viewed = pagesProgress[page.entry_id];
      });
    }

    if (lessonData.pages.length) selectPage(lessonData.pages[0], false);
  }
});

onBeforeRouteLeave((to, from, next) => {
  if (role.value === roles.ADMIN) {
    savePage().then(() => next());
  } else if (role.value === roles.USER) {
    saveLessonRecord().then(() => next())
  } else {
    next();
  }
});

watch(() => props.currTitle, (newTitle) => {
  const selectedPage = lessonData.pages.find((page) => page.selected);
  if (selectedPage) selectedPage.title = newTitle;
});

watch(() => props.currentContentViewed, (newViewed) => {
  const passedContent = props.passSaveContent();
  const maxPercent = lessonData.pages.length * 100;

  const foundPage = lessonData.pages.find((item) => item.id === passedContent.id);
  foundPage.viewed = newViewed;

  const currSumViewed = lessonData.pages.reduce((acc, page) => acc + page.viewed, 0);
  lessonData.complete = Math.round((currSumViewed / maxPercent) * 100);
});

function saveContent() {
  const passedContent = props.passSaveContent();
  const { title, content, banner_data, quizzes } = passedContent;

  const foundPage = lessonData.pages.find((item) => String(item.id) === String(passedContent.id));
  foundPage.title = title;
  foundPage.content = content;
  foundPage.banner_data = banner_data;
  foundPage.quizzes = quizzes;
}

async function saveLessonRecord() {
  const pages_progress = {};
  const page_ids = lessonData.pages.map((page) => {
    pages_progress[page.entry_id] = page.viewed;
    return page.entry_id
  });

  await Promise.all([
    updatePagesProgress(page_ids, pages_progress),
    updateLessonProgress(currentLesson.value.id, lessonData.complete)
  ]);
}

async function savePage() {
  if (lessonData.pages.length) {
    saveContent();
    await updatePrevPage();
  }

  const page_ids = lessonData.pages.map((page) => page.entry_id);

  await mutationUpdateLesson.executeMutation({
    project_id: localStorage.getItem('project_id'),
    lesson_id: currentLesson.value.id,
    lesson_name: props.lessonName,
    lesson_pages: page_ids.length ?
      setElementValueInputEntry(
        {
          id__in: page_ids
        }
      ) : {}
  });
}

async function addPage(page = null) {
  const isEvent = page instanceof Event;

  if (isEvent) page = null;

  if (isEvent && lessonData.pages.length) {
    saveContent();
    await updatePrevPage();
    unselectAllPages();
  }

  const [lastPage] = lessonData.pages.slice(-1);

  lessonData.pages.push({
    id: page ? page.page_order_id : lastPage ? Number.parseInt(lastPage.id) + 1 : 1,
    title: page ? page.name : 'New Page',
    content: page ? page.elements
      .find((element) => element.api_name.includes('element__html_content__text')).value : '',
    quizzes: page ? page.quizzes : [],
    selected: !page,
    viewed: 0,
  });

  const [newPage] = lessonData.pages.slice(-1);

  if (!isEvent && page) {
    newPage.entry_id = page.id;
    newPage.banner_data = page.banner_data;
  } else {
    const newId = generateId(Math.floor(Math.random() * 7) + 1);

    mutationCreatePage.executeMutation({
      project_id: localStorage.getItem('project_id'),
      page_order_id: String(newPage.id),
      page_api_name: `entry__page_${newId}`,
      html_content: newPage.content,
      page_name: newPage.title
    })
      .then((res) => {
        newPage.entry_id = res.data.entries_create[0].id;
        newPage.banner_data = null;

        emit('addNewPage', {
          item: newPage,
          chaptersInfo: {
            current: lessonData.pages.length,
            length: lessonData.pages.length
          }
        });
      });
  }
}

async function updatePrevPage() {
  const foundPage = lessonData.pages.find((page) => page.selected === true);
  const copyQuizzesForDelete = [];

  for (const quiz of foundPage.quizzes) {
    if (!foundPage.content.includes(`data-quiz_id="${quiz.id}"`)) {
      copyQuizzesForDelete.push(quiz.id);
      foundPage.quizzes = foundPage.quizzes.filter((quizItem) => quizItem.id !== quiz.id);
    }
  }

  if (copyQuizzesForDelete.length) {
    queryQuizzesByIdsVariables.project_id = localStorage.getItem('project_id');
    queryQuizzesByIdsVariables.quiz_ids = copyQuizzesForDelete;

    await queryQuizzesByIds.executeQuery();
    const parsedQuizzesForDeletion = queryQuizzesByIds.data.value.entries_get.entries
      .map((quiz) => parseQuiz(quiz));
    await deleteQuizzes(parsedQuizzesForDeletion);
  }

  const quiz_ids = foundPage.quizzes.map((quizItem) => quizItem.id);

  mutationUpdatePage.executeMutation({
    project_id: localStorage.getItem('project_id'),
    page_id: foundPage.entry_id,
    html_content: foundPage.content,
    page_name: foundPage.title,
    banner_data: foundPage.banner_data ? foundPage.banner_data : "",
    page_quizzes: quiz_ids.length ?
      setElementValueInputEntry(
        {
          id__in: quiz_ids
        }
      ) : {}
  });
}

function deletePage({ item, menuOptions, menuItem, refOnShallowRef }) {
  menuItem.load = true;
  triggerRef(refOnShallowRef);

  pagesDeletion([item.value]).then(() => {
    const indexOfUpItem = lessonData.pages.findIndex((page) => page.id === item.value.id);
    let upItem = null;

    if (indexOfUpItem === 0 && lessonData.pages.length > 1) {
      upItem = lessonData.pages[indexOfUpItem + 1];
    } else {
      upItem = lessonData.pages[indexOfUpItem - 1];
    }

    if (upItem) {
      selectPage(upItem, false);
    } else {
      emit('noPages');
    }

    menuItem.load = false;
    triggerRef(refOnShallowRef);
    menuOptions.style.display = 'none';

    lessonData.pages = lessonData.pages.filter((page) => page.id !== item.value.id);
  });
}

async function selectPage(item, save = true) {
  if (save && role.value === roles.ADMIN) {
    saveContent();
    await updatePrevPage();
  }

  unselectAllPages();
  item.selected = true;

  const currentIndex = lessonData.pages.findIndex((page) => page.id === item.id);

  emit('changePage', {
    item,
    chaptersInfo: {
      current: currentIndex + 1,
      length: lessonData.pages.length
    }
  });
}

function unselectAllPages() {
  lessonData.pages.forEach((item) => {
    if (item.selected) item.selected = false;
  });
}

function toggleMenu({ event, menuOptions, popperItem, generateGetBoundingClientRect }) {
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

function onDrop(event) {
  const transferredPageId = event.dataTransfer.getData('pageId');
  const draggedPage = lessonData.pages
    .find((page) => Number.parseInt(page.id) === Number.parseInt(transferredPageId));
  const targetIdOnDrop = getParentElementWithClass(event.target, 'page__item').dataset.pageId;
  const foundTargetPage = lessonData.pages
    .find((page) => Number.parseInt(page.id) === Number.parseInt(targetIdOnDrop));

  draggedPage.id = targetIdOnDrop;
  foundTargetPage.id = transferredPageId;

  selectPage(draggedPage, false);

  mutationUpdatePageOrderId.executeMutation({
    project_id: localStorage.getItem('project_id'),
    page_id: draggedPage.entry_id,
    page_order_id: String(draggedPage.id)
  }).then(() => {
    mutationUpdatePageOrderId.executeMutation({
      project_id: localStorage.getItem('project_id'),
      page_id: foundTargetPage.entry_id,
      page_order_id: String(foundTargetPage.id)
    });
  })

  lessonData.pages.sort((a, b) => Number.parseInt(a.id) - Number.parseInt(b.id));
}

function onStartDrag(event, pageItem) {
  selectPage(pageItem);
  event.dataTransfer.dropEffect = 'move';
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('pageId', pageItem.id);
}
</script>

<template>
  <div class="pages-panel">
    <div v-if="role === roles.ADMIN" class="pages-panel-heading">
      <div class="pages-panel__label">
        Pages
      </div>
      <button
        type="button"
        class="pages-panel__add"
        @click="addPage"
      >
        <AddIcon :size="13" />
      </button>
    </div>
    <div v-else class="pages-panel__user-heading">
      <div class="pages-panel__user-heading__part">
        <div class="pages-panel__user-heading-label">
          {{ lessonData.complete }}% Completed
        </div>
      </div>
      <div class="pages-panel__user-heading__part">
        <div class="pages-panel__user-heading-remain" />
        <div
          class="pages-panel__user-heading-progress"
          :style="{
            width: lessonData.complete + '%',
          }"
        />
      </div>
    </div>
    <div class="pages-panel__container">
      <div
        class="pages-container"
        @drop="onDrop"
        @dragenter.prevent
        @dragover.prevent
      >
        <PageItem
          v-for="pageItem of lessonData.pages"
          :key="pageItem.id"
          :page="pageItem"
          :draggable="role === roles.ADMIN"
          :data-page-id="pageItem.id"
          @click="selectPage(pageItem)"
          @toggle-menu="toggleMenu"
          @delete-page="deletePage"
          @dragstart="onStartDrag($event, pageItem)"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.pages-panel {
  position: relative;
  max-height: 75vh;
  min-height: 75vh;
  overflow-y: auto;
  border-right: 1px solid #eaeaea;
  background-color: #FCFCFD;
  border-radius: 0.25rem;
  border-right: 1px solid #D0D5DD;

  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  &-heading {
    position: relative;
    padding: 30px 25px;
  }

  &__user-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30px 25px;

    &__part {
      min-width: 45%;
      min-height: 7px;
      position: relative;
    }

    &-label {
      color: #0B243D;
      font-weight: 700;
      font-size: 14px;
    }

    &-progress,
    &-remain {
      position: absolute;
      height: 7px;
      min-height: 7px;
      border-radius: 30px;
      max-width: 100%;
    }

    &-progress {
      width: 5%;
      min-width: 5%;
      background-color: #358DE8;
    }

    &-remain {
      position: absolute;
      width: 100%;
      background-color: #EAECF0;
    }
  }

  &__label {
    font-weight: 700;
    font-size: 14px;
    color: #0B243D;
  }

  &__add {
    cursor: pointer;
    border: 0;
    outline: none;
    background: #A6B2C1;
    border: 1px solid #A6B2C1;
    border-radius: 6px;
    position: absolute;
    padding: 3px 10px;
    right: 32px;
    top: 50%;
    transform: translateY(-50%);
  }

  .pages-panel__container {
    width: 100%;
    background-color: inherit;
  }

  .pages-container {}
}
</style>
