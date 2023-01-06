import { useClientHandle } from '@urql/vue';

// Hooks
import useProgress from './useProgress.js';
import useParsQuiz from './useParseQuiz.js';
import useQuizzesDeletion from './useQuizzesDeletion.js';

// API
import {
  mutationDeleteLessonWithCategoriesBody,
  mutationDeletePagesBody,
  mutationDeleteLessonsWithCategoriesBody
} from '../API/mutationBodies.js';
import {
  queryQuizzesByIdsBody
} from '../API/queryBodies.js';

export default function usePagesDeletion() {
  // Global
  const handleClient = useClientHandle();

  // Hooks
  const { deleteEntryProgress, deleteEntriesProgress } = useProgress();
  const { parseQuiz } = useParsQuiz();
  const { deleteQuizzes } = useQuizzesDeletion();

  const mutationDeleteLessonWithCategories = handleClient.useMutation(mutationDeleteLessonWithCategoriesBody);
  const mutationDeleteLessonsWithCategories = handleClient.useMutation(mutationDeleteLessonsWithCategoriesBody);
  const mutationDeletePages = handleClient.useMutation(mutationDeletePagesBody);

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

  async function deleteLessons(lessons) {
    const lesson_ids = lessons.map((lesson) => lesson.id);
    const all_category_ids = [];
    const all_pages = [];

    await deleteEntriesProgress(lesson_ids);

    for (const lesson of lessons) {
      const lesson_pages = lesson.elements
        .find((element) => element.api_name.includes('element__lesson_pages__entry'))
        .value ?? [];
      all_pages.push(...lesson_pages);

      const lesson_categories = lesson.elements
        .find((element) => element.api_name.includes('element__lesson_categories__entry'))
        .value;
      const category_ids = (lesson_categories && lesson_categories.map((category) => category.id)) ?? [];
      all_category_ids.push(...category_ids);
    }

    await pagesDeletion(all_pages);

    await mutationDeleteLessonsWithCategories.executeMutation({
      project_id: localStorage.getItem('project_id'),
      entry_ids: [...all_category_ids, ...lesson_ids]
    });
  }

  async function deleteLesson(lesson) {
    const lesson_pages = lesson.elements
      .find((element) => element.api_name.includes('element__lesson_pages__entry'))
      .value;
    const lesson_categories = lesson.elements
      .find((element) => element.api_name.includes('element__lesson_categories__entry'))
      .value;
    const category_ids = (lesson_categories && lesson_categories.map((category) => category.id)) ?? [];

    if (lesson_pages && lesson_pages.length) await pagesDeletion(lesson_pages, false);

    await deleteEntryProgress(lesson.id);

    await mutationDeleteLessonWithCategories.executeMutation({
      project_id: localStorage.getItem('project_id'),
      entry_ids: [...category_ids, lesson.id]
    });
  }

  async function pagesDeletion(lesson_pages) {
    const page_ids = lesson_pages.map((page) => page.entry_id ? page.entry_id : page.id);
    const all_quizzes = [];

    await deleteEntriesProgress(page_ids);

    for (const page of lesson_pages) {
      const page_quizzes = page.quizzes ?
        page.quizzes
        :
        page.elements.find(
          (element) => element.api_name.includes('element__quizzes__entry')
        ).value;

      if (page_quizzes && page_quizzes.length) all_quizzes.push(...page_quizzes);
    }

    if (all_quizzes.length) {
      const quiz_ids = all_quizzes.map((quiz) => quiz.id);
      queryQuizzesByIdsVariables.project_id = localStorage.getItem('project_id');
      queryQuizzesByIdsVariables.quiz_ids = quiz_ids;

      await queryQuizzesByIds.executeQuery();
      const parsedQuizzesForDeletion = queryQuizzesByIds.data.value.entries_get.entries
        .map((quiz) => parseQuiz(quiz));
      await deleteQuizzes(parsedQuizzesForDeletion);
    }

    await mutationDeletePages.executeMutation({
      project_id: localStorage.getItem('project_id'),
      page_ids: page_ids
    });
  }

  return {
    pagesDeletion,
    deleteLesson,
    deleteLessons
  }
}
