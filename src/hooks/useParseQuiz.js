import {
  getEntryElement,
  getAllNonEntryElements,
  getResultValueByApiName
} from '../helpers/parserTools.js';

export default function useParseQuiz() {
  function parseQuiz(quiz) {
    const results = [];

    const elementQuestions = quiz.elements
      .find((element) => element.api_name.includes('element__questions__entry'));
    results.push(getEntryElement(elementQuestions, parseQuestion));

    return {
      id: quiz.id,
      questions: results
    }
  }

  function parseQuestion(question) {
    const results = getAllNonEntryElements(question);

    const elementQuestionAnswers = question.elements
      .find((element) => element.api_name.includes('element__question_answers__entry'));
    results.push(getEntryElement(elementQuestionAnswers, parseQuestionAnswers));

    const variants_of_answers = getResultValueByApiName(results, 'element__variants_of_answers__text');
    const correct_answers = getResultValueByApiName(results, 'element__correct_answers__text') ?? '';

    return {
      id: question.id,
      question: question.name[0].text_value,
      created_at: new Date(question.created_at).getTime(),
      correct_answers,
      variants_of_answers,
      elements: results
    }
  }

  function parseQuestionAnswers(questionAnswers) {
    const results = getAllNonEntryElements(questionAnswers);

    return {
      id: questionAnswers.id,
      elements: results
    }
  }

  return {
    parseQuiz,
    parseQuestion
  }
}
