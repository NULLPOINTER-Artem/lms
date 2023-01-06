import { useClientHandle } from '@urql/vue';

// Helpers
import generateId from '../helpers/generateId.js';

// Hooks
import useParseCourse from './useParseCourse.js';

// API
import {
  queryUserProgressBody,
  queryUserProgressForUpdateBody,
  queryAllUserProgressBody,
  queryAllUserProgressForUpdateBody,
  queryCourseByLessonIdBody,
} from '../API/queryBodies.js';
import {
  mutationUpdateUserProgressBody,
  mutationCreateUserProgressBody,
  mutationDeleteUserProgressBody,
  mutationDeleteAllUserProgressBody
} from '../API/mutationBodies.js';

export default function useProgress() {
  const handleClient = useClientHandle();

  // Hooks
  const { parseCourse } = useParseCourse();

  const mutationCreateUserProgress = handleClient.useMutation(mutationCreateUserProgressBody);
  const mutationUpdateUserProgress = handleClient.useMutation(mutationUpdateUserProgressBody);
  const mutationDeleteUserProgress = handleClient.useMutation(mutationDeleteUserProgressBody);
  const mutationDeleteAllUserProgress = handleClient.useMutation(mutationDeleteAllUserProgressBody);

  const queryUserProgressVariables = {
    project_id: localStorage.getItem('project_id'),
    user_id: '',
    entry_id: ''
  }
  const queryUserProgress = handleClient.useQuery({
    query: queryUserProgressBody,
    pause: true,
    variables: queryUserProgressVariables,
    context: {
      requestPolicy: 'network-only'
    }
  });

  const queryUserProgressForUpdateVariables = {
    project_id: localStorage.getItem('project_id'),
    user_id: '',
    entry_id: ''
  }
  const queryUserProgressForUpdate = handleClient.useQuery({
    query: queryUserProgressForUpdateBody,
    pause: true,
    variables: queryUserProgressForUpdateVariables,
    context: {
      requestPolicy: 'network-only'
    }
  });

  const queryAllUserProgressForUpdateVariables = {
    project_id: localStorage.getItem('project_id'),
    user_id: '',
    entry_ids: []
  }
  const queryAllUserProgressForUpdate = handleClient.useQuery({
    query: queryAllUserProgressForUpdateBody,
    pause: true,
    variables: queryAllUserProgressForUpdateVariables,
    context: {
      requestPolicy: 'network-only'
    }
  });

  const queryAllUserProgressVariables = {
    project_id: localStorage.getItem('project_id'),
    user_id: '',
    entry_ids: []
  }
  const queryAllUserProgress = handleClient.useQuery({
    query: queryAllUserProgressBody,
    pause: true,
    variables: queryAllUserProgressVariables,
    context: {
      requestPolicy: 'network-only'
    }
  });

  const queryCourseByLessonIdVariables = {
    project_id: localStorage.getItem('project_id'),
    lesson_id: ''
  }
  const queryCourseByLessonId = handleClient.useQuery({
    query: queryCourseByLessonIdBody,
    pause: true,
    variables: queryCourseByLessonIdVariables,
    context: {
      requestPolicy: 'network-only'
    }
  });

  function queryCurrentUserProgress(entry_id) {
    queryUserProgressVariables.user_id = localStorage.getItem('user_id');
    queryUserProgressVariables.entry_id = entry_id;

    return queryUserProgress.executeQuery();
  }

  function queryCurrentAllUserProgress(entry_ids) {
    queryAllUserProgressVariables.user_id = localStorage.getItem('user_id');
    queryAllUserProgressVariables.entry_ids = entry_ids;

    return queryAllUserProgress.executeQuery();
  }

  function queryCurrentProgressForUpdate(entry_id) {
    queryUserProgressForUpdateVariables.user_id = localStorage.getItem('user_id');
    queryUserProgressForUpdateVariables.entry_id = entry_id;

    return queryUserProgressForUpdate.executeQuery();
  }

  function queryAllProgressForUpdate(entry_ids) {
    queryAllUserProgressForUpdateVariables.user_id = localStorage.getItem('user_id');
    queryAllUserProgressForUpdateVariables.entry_ids = entry_ids;

    if (entry_ids.length) {
      return queryAllUserProgressForUpdate.executeQuery();
    }

    return Promise.resolve();
  }

  function createUserProgress(entry_id, progress) {
    const newId = generateId(Math.floor(Math.random() * 7) + 1);

    return mutationCreateUserProgress.executeMutation({
      project_id: localStorage.getItem('project_id'),
      progress_api_name: `api_record_${entry_id}_${newId}`,
      progress_name: `record_${entry_id}_${newId}`,
      user_id: localStorage.getItem('user_id'),
      entry_id,
      record: String(progress)
    });
  }

  function updateUserProgress(entry_id, progress) {
    return mutationUpdateUserProgress.executeMutation({
      project_id: localStorage.getItem('project_id'),
      user_id: localStorage.getItem('user_id'),
      entry_id,
      record: String(progress)
    });
  }

  async function safeUpdate(entry_id, progress) {
    const response = await queryCurrentProgressForUpdate(entry_id);

    if (response.data.value && response.data.value.entries_get.entries.length) {
      await updateUserProgress(entry_id, progress);
    } else {
      await createUserProgress(entry_id, progress);
    }
  }

  async function safeUpdateAll(entry_ids, progress) {
    const response = await queryAllProgressForUpdate(entry_ids);
    const entry_ids_for_update = response.data.value.entries_get.entries.map((progress) => {
      return progress.elements
        .find((element) => element.api_name.includes('element__current_entry_id__text'))
        .value.text[0].value
    });
    const entry_ids_for_create = entry_ids.filter((entry_id) => !entry_ids_for_update.includes(entry_id));

    await Promise.all([
      ...entry_ids_for_create
        .map((entry_id) => createUserProgress(entry_id, progress[entry_id])),
      ...entry_ids_for_update
        .map((entry_id) => updateUserProgress(entry_id, progress[entry_id]))
    ]);
  }

  async function safeDelete(entry_id) {
    const response = await queryCurrentUserProgress(entry_id);

    if (response.data.value && response.data.value.entries_get.entries.length) {
      await mutationDeleteUserProgress.executeMutation({
        project_id: localStorage.getItem('project_id'),
        user_id: localStorage.getItem('user_id'),
        entry_id: entry_id
      });
    }
  }

  async function safeDeleteAll(entry_ids) {
    const response = await queryAllProgressForUpdate(entry_ids);
    const entry_ids_for_delete = response.data.value.entries_get.entries.map((progress) => {
      return progress.elements
        .find((element) => element.api_name.includes('element__current_entry_id__text'))
        .value.text[0].value
    });

    if (entry_ids_for_delete.length) {
      await mutationDeleteAllUserProgress.executeMutation({
        project_id: localStorage.getItem('project_id'),
        user_id: localStorage.getItem('user_id'),
        entry_ids: entry_ids_for_delete
      });
    }
  }

  function calcSumProgress(allProgress) {
    return allProgress.reduce((acc, progress) => {
      const curr_progress = progress.elements
        .find((element) => element.api_name.includes('element__progress_percent__number'));

      return acc += Number.parseInt(curr_progress.value.number);
    }, 0);
  }

  async function updatePagesProgress(page_entry_ids, progress) {
    await safeUpdateAll(page_entry_ids, progress);
  }

  async function updateLessonProgress(lesson_entry_id, lessonProgress) {
    queryCourseByLessonIdVariables.project_id = localStorage.getItem('project_id');
    queryCourseByLessonIdVariables.lesson_id = lesson_entry_id;

    const [response_queryCourseByLessonId] = await Promise.all([
      queryCourseByLessonId.executeQuery(),
      safeUpdate(lesson_entry_id, lessonProgress)
    ]);

    const parsedCourse = parseCourse(response_queryCourseByLessonId.data.value.entries_get.entries[0]);
    const courseSections = parsedCourse.elements
      .find((element) => element.api_name.includes('element__sections__entry'))
      .value ?? [];
    const currentSectionForUpdate = courseSections.find((section) => {
      const sectionLessons = section.elements
        .find((element) => element.api_name.includes('element__lessons__entry'))
        .value ?? [];

      return sectionLessons.find((lesson) => lesson.id === lesson_entry_id);
    });
    const sectionLessons = currentSectionForUpdate.elements
      .find((element) => element.api_name.includes('element__lessons__entry'))
      .value ?? [];
    const section_ids = courseSections
      .map((section) => section.id)
      .filter((section_id) => section_id !== currentSectionForUpdate.id);
    const lesson_ids = sectionLessons
      .map((lesson) => lesson.id)
      .filter((lesson_id) => lesson_id !== lesson_entry_id);

    const allProgress = await queryAllProgressForUpdate([...lesson_ids, ...section_ids]);
    const sectionsProgress = [];
    const lessonsProgress = [];

    if (allProgress) {
      for (const progress of allProgress.data.value.entries_get.entries) {
        const entryId = progress.elements
          .find((element) => element.api_name.includes('element__current_entry_id__text'))
          .value.text[0].value

        if (lesson_ids.includes(entryId)) lessonsProgress.push(progress);
        else sectionsProgress.push(progress);
      }
    }

    const sumLessonsProgress = calcSumProgress(lessonsProgress) + lessonProgress;
    const sectionMaxProgress = sectionLessons.length * 100;
    const sectionProgress = Math.round((sumLessonsProgress / sectionMaxProgress) * 100);

    const sumSectionsProgress = calcSumProgress(sectionsProgress) + sectionProgress;
    const courseMaxProgress = courseSections.length * 100;
    const courseProgress = Math.round((sumSectionsProgress / courseMaxProgress) * 100);

    await safeUpdateAll([currentSectionForUpdate.id, parsedCourse.id], {
      [currentSectionForUpdate.id]: sectionProgress,
      [parsedCourse.id]: courseProgress
    });
  }

  async function deleteEntryProgress(entry_id) {
    await safeDelete(entry_id);
  }

  async function deleteEntriesProgress(entry_ids) {
    await safeDeleteAll(entry_ids);
  }

  async function getProgress(entry_id) {
    const response_pageProgress = await queryCurrentUserProgress(entry_id);
    let progress = 0;

    if (response_pageProgress.data.value) {
      const curr_entry_progress = response_pageProgress.data.value.entries_get.entries;

      if (curr_entry_progress.length) {
        const curr_progress = curr_entry_progress[0].elements
          .find((element) => element.api_name.includes('element__progress_percent__number'));
        progress = Number.parseInt(curr_progress.value.number);
      }
    }

    return progress;
  }

  async function getAllProgress(entry_ids) {
    const resultObj = {};

    if (entry_ids.length) {
      const response_entriesProgress = await queryCurrentAllUserProgress(entry_ids);

      if (response_entriesProgress.data.value) {
        response_entriesProgress.data.value.entries_get.entries.forEach((entryProgress) => {
          const progress = entryProgress.elements
            .find((element) => element.api_name.includes('element__progress_percent__number'))
            .value.number
          const entry_id = entryProgress.elements
            .find((element) => element.api_name.includes('element__current_entry_id__text'))
            .value.text[0].value

          resultObj[entry_id] = Number.parseInt(progress);
        });
      }
    }

    return resultObj;
  }

  return {
    queryCurrentUserProgress,
    queryCurrentAllUserProgress,
    createUserProgress,
    updateUserProgress,
    updatePagesProgress,
    updateLessonProgress,
    deleteEntryProgress,
    deleteEntriesProgress,
    getProgress,
    getAllProgress
  }
}
