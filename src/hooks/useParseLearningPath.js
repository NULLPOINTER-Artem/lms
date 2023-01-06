import {
  getEntryElement,
  getAllNonEntryElements,
  getResultValueByApiName
} from '../helpers/parserTools.js';

export default function useParseLearningPath() {
  function parseLearningPath(learningPath) {
    const results = getAllNonEntryElements(learningPath);

    const elementCourses = learningPath.elements
      .find((element) => element.api_name.includes('element__courses__entry'));
    results.push(getEntryElement(elementCourses, parseCourseForLP));

    const LP_description = getResultValueByApiName(results, 'element__lp_description__text');
    const LP_courses = getResultValueByApiName(results, 'element__courses__entry') ?? [];

    const duration = LP_courses.reduce((acc, course) => acc += course.duration, 0);
    const count_courses = LP_courses.length;
    const count_lessons = LP_courses.reduce((acc, course) => acc += course.count_lessons, 0);

    return {
      id: learningPath.id,
      name: learningPath.name[0].text_value,
      created_at: learningPath.created_at ? new Date(learningPath.created_at).getTime() : 0,
      description: LP_description ?? '',
      duration,
      count_courses,
      count_lessons,
      courses: LP_courses.sort(
        (prevCourse, currCourse) =>
          prevCourse.course_order[learningPath.id] - currCourse.course_order[learningPath.id]
      ),
      elements: results
    }
  }

  function parseCourseForLP(course) {
    const results = getAllNonEntryElements(course);

    const elementSections = course.elements.find(
      (element) => element.api_name.includes('element__sections__entry')
    );
    results.push(getEntryElement(elementSections, parseSection));

    const duration = getResultValueByApiName(results, 'element__course_duration__number');
    const course_order = getResultValueByApiName(results, 'element__course_order__text');
    const course_description = getResultValueByApiName(results, 'element__course_description__text') ?? '';
    const course_sections = getResultValueByApiName(results, 'element__sections__entry') ?? [];
    const course_banner = getResultValueByApiName(results, 'element__course_banner__text') ?? '';

    let duration_in_hours = 0;
    if (duration) duration_in_hours = Math.round(Number.parseInt(duration) / 60);

    return {
      id: course.id,
      name: course.name[0].text_value,
      created_at: course.created_at ? new Date(course.created_at).getTime() : 0,
      description: course_description,
      duration: duration_in_hours,
      banner: course_banner,
      count_lessons: course_sections.reduce((acc, item) => acc += item.count_lessons, 0),
      sections: course_sections.sort((a, b) => a.created_at - b.created_at),
      course_order: course_order ? JSON.parse(course_order) : {},
      elements: results
    }
  }

  function parseSection(section) {
    const results = getAllNonEntryElements(section);

    const elementLessons = section.elements.find(
      (element) => element.api_name.includes('element__lessons__entry')
    );
    results.push(getEntryElement(elementLessons, parseLesson));

    const section_lessons = getResultValueByApiName(results, 'element__lessons__entry') ?? [];
    const section_description = getResultValueByApiName(results, 'element__section_description__text') ?? '';

    return {
      id: section.id,
      created_at: section.created_at ? new Date(section.created_at).getTime() : 0,
      name: section.name ? section.name[0].text_value : '',
      description: section_description,
      count_lessons: section_lessons.length,
      lessons: section_lessons.sort((a, b) => a.order_id - b.order_id),
      elements: results
    }
  }

  function parseLesson(lesson) {
    if (lesson.elements) {
      const results = getAllNonEntryElements(lesson);

      const order_id = Number.parseInt(getResultValueByApiName(results, 'element__lesson_order__text') ?? 0);
      const lesson_description = getResultValueByApiName(results, 'element__lesson_description__text') ?? '';

      return {
        id: lesson.id,
        name: lesson.name ? lesson.name[0].text_value : '',
        order_id,
        description: lesson_description,
      }
    }

    return {
      id: lesson.id,
      name: lesson.name ? lesson.name[0].text_value : '',
    }
  }

  return {
    parseLearningPath,
    parseCourseForLP
  }
}
