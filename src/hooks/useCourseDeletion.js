import { useClientHandle } from '@urql/vue';

// Hooks
import useParseLesson from './useParseLesson.js';
import usePagesDeletion from './usePagesDeletion.js';
import useProgress from './useProgress.js';

// API
import {
  mutationDeleteCourseBody,
  mutationDeleteSectionsBody,
} from '../API/mutationBodies.js';

import {
  queryLessonsByIdsBody
} from '../API/queryBodies.js';

export default function useCourseDeletion() {
  const handleClient = useClientHandle();

  // Hooks
  const { deleteLessons } = usePagesDeletion();
  const { parseLesson } = useParseLesson();
  const { deleteEntryProgress, deleteEntriesProgress } = useProgress();

  const mutationDeleteCourse = handleClient.useMutation(mutationDeleteCourseBody);
  const mutationDeleteSections = handleClient.useMutation(mutationDeleteSectionsBody);

  const queryLessonsByIdsVariables = {
    project_id: localStorage.getItem('project_id'),
    lesson_ids: []
  };
  let queryLessonsByIds = handleClient.useQuery({
    query: queryLessonsByIdsBody,
    pause: true,
    variables: queryLessonsByIdsVariables,
    context: {
      requestPolicy: 'network-only'
    }
  });

  async function deleteCourse(course) {
    const elementSections = course.elements
      .find((element) => element.api_name.includes('element__sections__entry'))
      .value;

    if (elementSections && elementSections.length) await deleteSections(elementSections);

    await deleteEntryProgress(course.id);

    await mutationDeleteCourse.executeMutation({
      project_id: localStorage.getItem('project_id'),
      course_id: course.id
    });
  }

  async function deleteSections(sections) {
    const section_ids = sections.map((section) => section.id);
    const all_lessons = [];

    await deleteEntriesProgress(section_ids);

    for (const section of sections) {
      const lessons = section.elements
        .find((element) => element.api_name.includes('element__lessons__entry'))
        .value;

      if (lessons && lessons.length) all_lessons.push(...lessons);
    }

    if (all_lessons.length) {
      const hasElements = !!all_lessons[0].elements;

      if (hasElements) await deleteLessons(all_lessons);
      else await deleteLessonsInSections(all_lessons);
    }

    await mutationDeleteSections.executeMutation({
      project_id: localStorage.getItem('project_id'),
      section_ids: section_ids
    });
  }

  async function deleteLessonsInSections(lessons) {
    const lesson_ids = lessons.map((lesson) => lesson.id);

    queryLessonsByIdsVariables.project_id = localStorage.getItem('project_id');
    queryLessonsByIdsVariables.lesson_ids = lesson_ids;

    await queryLessonsByIds.executeQuery();
    const parsedLessons = queryLessonsByIds.data.value.entries_get.entries
      .map((lesson) => parseLesson(lesson));
    await deleteLessons(parsedLessons);
  }

  return {
    deleteCourse,
    deleteSections
  }
}
