import { useClientHandle } from '@urql/vue';

// Hooks
import useParseLesson from './useParseLesson.js';

// Helpers
import {
  getEntryElement,
  isNullValue,
  hasEntryValue,
  getAllNonEntryElements,
  getResultValueByApiName
} from '../helpers/parserTools.js';

// API
import {
  queryLearningPathsForCoursesBody,
} from '../API/queryBodies.js';

export default function useParseCourse() {
  const handleClient = useClientHandle();

  // Hooks
  const { parseLesson } = useParseLesson();

  const queryLearningPathsForCoursesVariables = {
    project_id: localStorage.getItem('project_id'),
    course_ids: []
  };
  const queryLearningPathsForCourses = handleClient.useQuery({
    query: queryLearningPathsForCoursesBody,
    pause: true,
    variables: queryLearningPathsForCoursesVariables,
    context: {
      requestPolicy: 'network-only'
    }
  });

  async function parseCourses(courses) {
    const parsedCourses = [];

    for (const course of courses) parsedCourses.push(parseCourse(course));

    if (courses.length) {
      queryLearningPathsForCoursesVariables.course_ids = courses.map((course) => course.id);
      const response_queryLPs = await queryLearningPathsForCourses.executeQuery();

      if (response_queryLPs.data.value) {
        for (const lp of response_queryLPs.data.value.entries_get.entries) {
          const path_courses = lp.elements
            .find((element) => element.api_name.includes('element__courses__entry')).value ?? { entries: [] };
          const path_course_ids = path_courses.entries.map((course) => course.id);
          const foundParsedCourses = parsedCourses
            .filter((parsedCourse) => path_course_ids.includes(parsedCourse.id));

          for (const foundParsedCourse of foundParsedCourses) {
            if (!foundParsedCourse.course_paths) {
              foundParsedCourse.course_paths = lp.name[0].text_value;
            } else {
              foundParsedCourse.course_paths += ' ' + lp.name[0].text_value;
            }
          }
        }
      }
    }

    return parsedCourses;
  }

  function parseCourse(course) {
    const results = getAllNonEntryElements(course);

    const elementSections = course.elements
      .find((element) => element.api_name.includes('element__sections__entry'));
    results.push(getEntryElement(elementSections, parseSection));

    const duration = getResultValueByApiName(results, 'element__course_duration__number');
    const description = getResultValueByApiName(results, 'element__course_description__text');
    const banner = getResultValueByApiName(results, 'element__course_banner__text');
    const banner_name = getResultValueByApiName(results, 'element__course_banner_name__text');
    const role_id = getResultValueByApiName(results, 'element__course_role_id__text');

    let precision_of_duration = '0/0';
    if (duration) {
      const [hours, minutes] = String(Number.parseInt(duration) / 60).split('.');
      precision_of_duration = `${hours}/${Math.round(Number.parseFloat(`0.${minutes}`) * 60)}`;
    }

    return {
      id: course.id,
      created_at: new Date(course.created_at).getTime(),
      name: course.name[0].text_value,
      description,
      duration: precision_of_duration,
      banner,
      banner_name,
      role_id,
      elements: results
    }
  }

  function parseSection(section) {
    const results = getAllNonEntryElements(section);

    const elementLessons = section.elements
      .find((element) => element.api_name.includes('element__lessons__entry'));
    const hasElements = !isNullValue(elementLessons) &&
      hasEntryValue(elementLessons) &&
      elementLessons.value.entries.length &&
      elementLessons.value.entries[0].elements;

    if (hasElements) {
      results.push(getEntryElement(elementLessons, parseLesson));
    } else {
      results.push(getEntryElement(elementLessons, parseLessonWithoutElements));
    }

    return {
      id: section.id,
      created_at: new Date(section.created_at).getTime(),
      name: section.name[0].text_value,
      elements: results
    }
  }

  function parseLessonWithoutElements(lesson) {
    return {
      id: lesson.id,
      name: lesson.name[0].text_value
    }
  }

  return {
    parseCourses,
    parseCourse,
    parseSection
  }
}
