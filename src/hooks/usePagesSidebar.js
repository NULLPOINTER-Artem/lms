import { createApp, onBeforeUnmount, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import urql from '@urql/vue';

// Store
import { roles, useUser } from '../stores/user.js';
import { useAPIStore } from '../stores/APIStore.js';

// Components
import QuizContainer from '../components/QuizContainer.vue';

export default function usePagesSidebar() {
  const { role } = storeToRefs(useUser());
  const quizInstances = new Map([]);

  onBeforeUnmount(() => deleteAllQuizInstances());

  function deleteAllQuizInstances() {
    quizInstances.forEach((item) => item.unmount());
    quizInstances.clear();
  }

  function addQuizInstance(quiz_id, instance) {
    quizInstances.set(quiz_id, instance);
  }

  function changeContent(data, currentContent) {
    deleteAllQuizInstances();
    const { content, title, id, entry_id, banner_data, viewed, quizzes } = data.item;

    currentContent.content = content;
    currentContent.title = title;
    currentContent.id = id;
    currentContent.currentPageId = entry_id;
    currentContent.banner_data = banner_data;
    currentContent.viewed = viewed;
    currentContent.quizzes = quizzes;
    currentContent.chaptersInfo = {
      ...data.chaptersInfo
    }

    nextTick(() => {
      if (currentContent.banner_data) {
        const img = document.querySelector('.editor-header__cover-container');
        img.style.backgroundImage = `url(${currentContent.banner_data})`;
      }
    });
  }

  function passContent(currentContent) {
    const { id, title, content, banner_data, viewed, quizzes } = currentContent;
    return { id, title, content, banner_data, viewed, quizzes };
  }

  async function insertQuizzesIntoContent(currentContent, contentSelector) {
    const page_content = document.querySelector(contentSelector);
    const APIStore = useAPIStore();

    for (const quiz of currentContent.quizzes) {
      const quizWrapper = page_content.querySelector(`[data-quiz_id="${quiz.id}"]`);

      if (quizWrapper) {
        const instance = createApp(QuizContainer, {
          quizId: quiz.id,
          role,
          roles,
          urlAPI: `${APIStore.getDomainAPI()}${APIStore.getEndPointGraphQL()}`
        })
          .use(urql, APIStore.getClient());

        addQuizInstance(quiz.id, instance);

        instance.mount(quizWrapper);
      }
    }
  }

  return {
    changeContent,
    passContent,
    insertQuizzesIntoContent,
    deleteAllQuizInstances,
    addQuizInstance
  };
}
