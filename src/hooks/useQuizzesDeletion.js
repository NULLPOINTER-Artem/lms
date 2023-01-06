import { useClientHandle } from '@urql/vue';

// API
import {
  mutationDeleteQuizzesWithAllEntriesBody
} from '../API/mutationBodies.js';

export default function useQuizzesDeletion() {
  // Global
  const handleClient = useClientHandle();

  const mutationDeleteQuizzesWithAllEntries = handleClient
    .useMutation(mutationDeleteQuizzesWithAllEntriesBody);

  async function deleteQuizzes(quizzes) {
    const quiz_ids = quizzes.map((quiz) => quiz.id);
    const question_ids = [];
    const answer_ids = [];

    for (const quiz of quizzes) {
      const curr_questions = quiz.questions
        .find((question) => question.api_name.includes('element__questions__entry'))
        .value;

      for (const question of curr_questions) {
        const curr_user_answers = question.elements
          .find((element) => element.api_name.includes('element__question_answers__entry'))
          .value;
        question_ids.push(question.id);

        if (curr_user_answers) {
          for (const user_answer of curr_user_answers) {
            answer_ids.push(user_answer.id);
          }
        }
      }
    }

    await mutationDeleteQuizzesWithAllEntries.executeMutation({
      project_id: localStorage.getItem('project_id'),
      entry_ids: [...answer_ids, ...question_ids, ...quiz_ids]
    });
  }

  return {
    deleteQuizzes
  }
}
