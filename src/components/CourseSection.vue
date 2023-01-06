<script setup>
import { onMounted, reactive, defineProps, defineEmits, ref } from 'vue';
import { useClientHandle } from '@urql/vue';
import { useRouter } from 'vue-router';

// Helpers
import generateId from '../helpers/generateId.js';
import getParentElementWithClass from '../helpers/getParentElementWithClass.js';

// API
import {
  mutationUpdateSectionBody,
  mutationCreateLessonBody,
} from '../API/mutationBodies.js';
import { setElementValueInputEntry } from '../API/tools/common.js';

// Hooks
import useParseLesson from '../hooks/useParseLesson.js';
import useDebounce from '../hooks/useDebounce.js';

// Components
import Loader from './LoaderComponent.vue';
import LessonsList from './LessonsList.vue';
import OptionsMenu from './OptionsMenu.vue';

// Component-icons
import AddIcon from './icons/AddIcon.vue';

const emit = defineEmits(['delete-section']);
const props = defineProps({
  section: {
    type: Object,
    required: true
  }
});

// Global
const router = useRouter();
const handleClient = useClientHandle();

// Hooks
const { parseLesson } = useParseLesson();

// State
const currentSection = reactive({
  name: 'New Section',
  description: '',
  lessons: [],
});
const loaderOnAddLesson = ref(false);

const mutationCreateLesson = handleClient.useMutation(mutationCreateLessonBody);
const mutationUpdateSection = handleClient.useMutation(mutationUpdateSectionBody);

onMounted(() => {
  const section_description = props.section.elements
    .find((element) => element.api_name.includes('element__section_description__text')).value;

  currentSection.name = props.section.name ?? 'New Section';
  currentSection.description = section_description ?? '';
  currentSection.lessons = [...props.section.lessons];
});

function onAddLesson() {
  loaderOnAddLesson.value = true;
  const newId = generateId(Math.floor(Math.random() * 7) + 1);
  const [lastLesson] = currentSection.lessons.slice(-1);

  mutationCreateLesson.executeMutation({
    project_id: localStorage.getItem('project_id'),
    lesson_api_name: `entry__lesson_${newId}`,
    lesson_name: `New Lesson`,
    lesson_description: '',
    lesson_order_id: lastLesson ? String(Number.parseInt(lastLesson.lesson_order_id) + 1) : '1',
  }).then(async (response) => {
    const newLesson = parseLesson(response.data.entries_create[0]);

    currentSection.lessons = [...currentSection.lessons, newLesson];
    await updateSection();

    router.push({
      name: 'lessonsEdit',
      params: {
        id: newLesson.id
      }
    }).then(() => loaderOnAddLesson.value = false);
  });
}

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

function onDelete(options) {
  emit('delete-section', options);
}

async function updateSection() {
  await mutationUpdateSection.executeMutation({
    project_id: localStorage.getItem('project_id'),
    section_id: props.section.id,
    section_name: currentSection.name,
    section_description: currentSection.description,
    section_lessons: currentSection.lessons.length ?
      setElementValueInputEntry(
        {
          id__in: currentSection.lessons.map((lesson) => lesson.id)
        }
      ) : {}
  });
}

const debouncedChangeSection = useDebounce(updateSection, 1000);

function onInputSectionName(event) {
  currentSection.name = event.target.textContent;
  debouncedChangeSection(currentSection.name);
}

function onInputSectionDescription(event) {
  currentSection.description = event.target.textContent;
  debouncedChangeSection(currentSection.description);
}

function onUpdateList(updatedList) {
  currentSection.lessons = updatedList;
}

function onUpdateLesson(updatedLesson) {
  currentSection.lessons[currentSection.lessons
    .findIndex((lesson) => lesson.id === updatedLesson.id)] = updatedLesson;
}

function onDeleteLesson(item) {
  updateSection().then(() => {
    currentSection.lessons = currentSection.lessons.filter((lesson) => lesson.id !== item.id);
  });
}
</script>

<template>
  <section class="course-section">
    <header class="course-section__header">
      <div class="course-section__name" contenteditable="true" @input="onInputSectionName">
        {{ currentSection.name }}
      </div>
      <p
        class="course-section__description"
        data-placeholder="Type description..."
        contenteditable="true"
        @input="onInputSectionDescription"
      >
        {{ currentSection.description }}
      </p>
      <OptionsMenu
        :item="props.section"
        :config="{
          edit: {
            show: false
          },
          delete: {
            text: 'Delete',
            show: true,
          },
          popperOffset: [10, 30]
        }"
        @delete="onDelete"
        @open-menu="onOpenOptions"
      />
    </header>
    <div class="course-section__lessons">
      <LessonsList
        :lessons="currentSection.lessons"
        :has-parent-controller="true"
        @list-updated="onUpdateList"
        @lesson-updated="onUpdateLesson"
        @delete-lesson="onDeleteLesson"
      />
      <button
        type="button"
        class="course-section__lessons-btn"
        :disabled="loaderOnAddLesson"
        @click="onAddLesson"
      >
        <AddIcon v-if="!loaderOnAddLesson" />
        <Loader v-else :load="loaderOnAddLesson" />
        Add Lesson
      </button>
    </div>
  </section>
</template>

<style lang="scss">
.course-section {
  padding: 30px 40px;

  &__header {
    position: relative;
    padding-bottom: 25px;
    margin-bottom: 20px;
    border-bottom: 1px solid #EAECF0;
  }

  &__name {
    font-weight: 700;
    font-size: 24px;
    color: #0B243D;
    text-transform: capitalize;
  }

  &__description {
    color: #475467;
    font-size: 14px;
    font-weight: 500;

    &[data-placeholder]:empty::before {
      position: absolute;
      content: attr(data-placeholder);
      pointer-events: none;
    }

    &[data-placeholder]:empty:focus:before {
      content: '';
    }
  }

  &__lessons {
    padding: 0 10px;

    &-btn {
      margin-left: 30px;
      position: relative;

      .loader {
        left: 0;
        top: 0;
        right: 0;
        margin-right: 7px;
        border-left: 1.1em solid #fff;
      }

      svg {
        margin-right: 7px;
      }

      display: flex;
      justify-content: center;
      align-items: center;
      color: #fff;
      padding: 10px 16px;
      background: #358DE8;
      border: 1px solid #358DE8;
      border-radius: 10px;
    }
  }

  .options-menu {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
