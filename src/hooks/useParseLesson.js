import {
  getEntryElement,
  getAllNonEntryElements,
  getResultValueByApiName
} from '../helpers/parserTools.js';

export default function useParseLesson() {
  function parseLesson(lesson) {
    const results = getAllNonEntryElements(lesson);

    const elementPages = lesson.elements.find(
      (element) => element.api_name.includes('element__lesson_pages__entry')
    );
    results.push(getEntryElement(elementPages, parsePage));

    const elementCategories = lesson.elements.find(
      (element) => element.api_name.includes('element__lesson_categories__entry')
    );
    results.push(getEntryElement(elementCategories, parseCategory));

    const lesson_order_id = getResultValueByApiName(results, 'element__lesson_order__text');
    const lesson_description = getResultValueByApiName(results, 'element__lesson_description__text') ?? '';

    return {
      id: lesson.id,
      created_at: new Date(lesson.created_at).getTime(),
      lesson_order_id: lesson_order_id,
      name: lesson.name[0].text_value,
      description: lesson_description,
      elements: results
    }
  }

  function parsePage(page) {
    const results = getAllNonEntryElements(page);

    const elementQuizzes = page.elements.find(
      (element) => element.api_name.includes('element__quizzes__entry')
    );
    results.push(getEntryElement(elementQuizzes, parseQuiz));

    return {
      id: page.id,
      created_at: new Date(page.created_at).getTime(),
      name: page.name[0].text_value,
      elements: results
    }
  }

  function parseQuiz(quiz) {
    return {
      id: quiz.id
    }
  }

  function parseCategory(category) {
    return {
      id: category.id,
      created_at: new Date(category.created_at).getTime(),
      name: category.name[0].text_value,
    }
  }

  return {
    parseLesson,
    parsePage,
    parseCategory
  }
}
