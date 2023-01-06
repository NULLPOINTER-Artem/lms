<script setup>
import { ref, defineProps, onMounted, computed } from 'vue';
import { useClientHandle } from '@urql/vue';

// Hooks
import useEventEmitter from '../hooks/useEventEmitter.js';
import useParseQuiz from '../hooks/useParseQuiz.js';

// Helpers
import { variantsToArray } from '../helpers/variantsTools.js';
import isEmptyObject from '../helpers/isEmptyObject.js';
import generateId from '../helpers/generateId.js';

// API
import {
  mutationUpdateQuizBody,
  mutationDeleteUserAnswerBody,
  mutationCreateUserAnswerBody,
  mutationUpdateQuestionAnswersBody
} from '../API/mutationBodies.js';
import {
  queryQuizBody,
} from '../API/queryBodies.js';
import { setElementValueInputEntry } from '../API/tools/common.js';
import axios from '../API/axios.config.js';

// Components
import EditQuiz from './EditQuiz.vue';
import ModalWindow from './ModalWindow.vue';

const props = defineProps({
  quizId: {
    type: String,
    required: true
  },
  role: {
    type: Object,
    required: true
  },
  roles: {
    type: Object,
    required: true
  },
  urlAPI: {
    type: String,
    required: true
  }
});

// Global
const handleClient = useClientHandle();

// Hooks
const { getEmitter } = useEventEmitter();
const { parseQuiz, parseQuestion } = useParseQuiz();

// State
let showEdit = ref(false);
let load = ref(false);
const quiz = ref({});
const currentQuestion = ref({});
const quizQuestions = ref([]);
const user_answer = ref('');
const emitterInstance = getEmitter();

// Computes
const currentIndex = computed(() => quizQuestions.value.findIndex(
  (question) => question.id === currentQuestion.value.id)
);
const variants_of_answer = computed(() => {
  if (!isEmptyObject(currentQuestion.value) && currentQuestion.value.variants_of_answers) {
    return variantsToArray(currentQuestion.value.variants_of_answers);
  }

  return [];
});
const currentUserAnswer = computed(() => {
  if (isEmptyObject(currentQuestion.value)) return null;

  const user_answers = currentQuestion.value.elements.find(
    (element) => element.api_name.includes('element__question_answers__entry')
  ).value;

  if (!user_answers || !user_answers.length) {
    return null;
  } else {
    const current_user_id = localStorage.getItem('user_id');
    const foundAnswerByCurrUser = user_answers.find((answer) => {
      const user_id = answer.elements.find(
        (element) => element.api_name.includes('element__user__user')
      ).value[0].id;

      return user_id === current_user_id;
    });

    if (!foundAnswerByCurrUser) {
      return null;
    } else {
      const user_answer_text = foundAnswerByCurrUser.elements
        .find((element) => element.api_name.includes('element__user_answers__text')).value;
      const is_correct = foundAnswerByCurrUser.elements
        .find((element) => element.api_name.includes('element__is_correct__boolean')).value;
      const user = foundAnswerByCurrUser.elements
        .find((element) => element.api_name.includes('element__user__user')).value;

      return {
        id: foundAnswerByCurrUser.id,
        answer_text: user_answer_text,
        is_correct,
        user
      };
    }
  }
});

const mutationUpdateQuiz = handleClient.useMutation(mutationUpdateQuizBody);
const mutationCreateUserAnswer = handleClient.useMutation(mutationCreateUserAnswerBody);
const mutationDeleteUserAnswer = handleClient.useMutation(mutationDeleteUserAnswerBody);
const mutationUpdateQuestionAnswers = handleClient.useMutation(mutationUpdateQuestionAnswersBody);

async function queryQuiz(quiz_id) {
  const response = await axios({
    url: props.urlAPI,
    method: 'POST',
    data: {
      operationName: 'queryQuiz',
      query: queryQuizBody,
      variables: {
        project_id: localStorage.getItem('project_id'),
        quiz_id
      }
    }
  });

  return response.data.data.entries_get.entries[0];
}

onMounted(async () => {
  load.value = true;
  const curr_quiz = await queryQuiz(props.quizId);

  quiz.value = parseQuiz(curr_quiz);
  quiz.value.questions = quiz.value.questions[0].value;
  quiz.value.questions.sort((a, b) => a.created_at - b.created_at);
  load.value = false;

  quizQuestions.value = [...quiz.value.questions];
  currentQuestion.value = quizQuestions.value[0];

  if (props.role.value === props.roles.USER) emitterInstance.emit('add-questions', quizQuestions.value);
});

function onSubmitAnswer() {
  const newId = generateId(Math.floor(Math.random() * 7) + 1);
  const curr_answers = currentQuestion.value.elements
    .find((element) => element.api_name.includes('element__question_answers__entry')).value;
  const current_user_id = localStorage.getItem('user_id');
  let is_correct = false;

  if (currentQuestion.value.correct_answers === user_answer.value) is_correct = true;

  mutationCreateUserAnswer.executeMutation({
    project_id: localStorage.getItem('project_id'),
    answer_api_name: `entry_answer_${newId}`,
    answer_name: `entry_answer_${newId}`,
    answers: user_answer.value,
    is_correct: is_correct,
    user_id: current_user_id
  }).then((response) => {
    let answer_ids = [];

    if (curr_answers) answer_ids = curr_answers.map((answer) => answer.id);

    answer_ids.push(response.data.entries_create[0].id);

    mutationUpdateQuestionAnswers.executeMutation({
      project_id: localStorage.getItem('project_id'),
      question_id: currentQuestion.value.id,
      user_answers: setElementValueInputEntry(
        {
          id__in: answer_ids
        }
      )
    }).then((response) => {
      const updatedQuestion = parseQuestion(response.data.entries_update[0]);
      onUpdatedQuestion(updatedQuestion);
      currentQuestion.value = updatedQuestion;

      if (props.role.value === props.roles.USER) emitterInstance.emit('submit-question');
    });
  })
}

function onRetry() {
  const curr_answers = currentQuestion.value.elements
    .find((element) => element.api_name.includes('element__question_answers__entry')).value;

  mutationDeleteUserAnswer.executeMutation({
    project_id: localStorage.getItem('project_id'),
    answer_id: currentUserAnswer.value.id
  }).then(() => {
    const answer_ids = curr_answers
      .filter((answer) => answer.id !== currentUserAnswer.value.id)
      .map((answer) => answer.id);

    mutationUpdateQuestionAnswers.executeMutation({
      project_id: localStorage.getItem('project_id'),
      question_id: currentQuestion.value.id,
      user_answers: answer_ids.length ?
        setElementValueInputEntry(
          {
            id__in: answer_ids
          }
        ) : {},
    }).then((response) => {
      const updatedQuestion = parseQuestion(response.data.entries_update[0]);
      onUpdatedQuestion(updatedQuestion);
      currentQuestion.value = updatedQuestion;

      if (props.role.value === props.roles.USER) emitterInstance.emit('retry-question');
    });
  });
}

function onUpdatedQuestion(updatedQuestion) {
  const foundIndex = quizQuestions.value
    .findIndex((question) => question.id === updatedQuestion.id);
  quizQuestions.value[foundIndex] = updatedQuestion;
}

function onAddNewQuestion(newQuestion) {
  quizQuestions.value.push(newQuestion);
  const question_ids = quizQuestions.value.map((question) => question.id);

  updateQuizQuestions(question_ids);
}

function onDeleteQuestion(question_id) {
  quizQuestions.value = quizQuestions.value
    .filter((question) => question.id !== question_id);
  const question_ids = quizQuestions.value.map((question) => question.id);
  updateQuizQuestions(question_ids);
}

function updateQuizQuestions(question_ids) {
  mutationUpdateQuiz.executeMutation({
    project_id: localStorage.getItem('project_id'),
    quiz_id: quiz.value.id,
    quiz_questions: question_ids.length ?
      setElementValueInputEntry(
        {
          id__in: question_ids
        }
      ) : {},
  });
}

function onPrevQuestion() {
  if (checkOnPrevQuestion()) {
    currentQuestion.value = quizQuestions.value[currentIndex.value - 1];
    user_answer.value = '';
  }
}

function onNextQuestion() {
  if (checkOnNextQuestion()) {
    currentQuestion.value = quizQuestions.value[currentIndex.value + 1];
    user_answer.value = '';
  }
}

function checkOnNextQuestion() {
  return (quizQuestions.value.length > 1 &&
    (currentIndex.value + 1) !== quizQuestions.value.length);
}

function checkOnPrevQuestion() {
  return currentIndex.value !== 0;
}

function onToggleEdit() {
  showEdit.value = !showEdit.value;
}
</script>

<template>
  <div class="quiz-container">
    <div class="quiz-admin" v-if="props.role.value === props.roles.ADMIN">
      <p>This is Quiz Container, {{ quiz.id }}</p>
      <button
        v-if="!load"
        class="quiz-admin__btn"
        type="button"
        @click="onToggleEdit"
      >
        Edit
      </button>
    </div>
    <div
      v-else
      class="quiz-question"
    >
      <div @click="onPrevQuestion" v-show="checkOnPrevQuestion()" class="quiz-question__prev-btn" />
      <div v-if="!isEmptyObject(currentQuestion)" class="quiz-question__container">
        <div class="quiz-question__number">
          {{ currentIndex + 1 }}/{{ quizQuestions.length }}
        </div>
        <div class="quiz-question__description">
          {{ currentQuestion.question }}
        </div>
        <div v-if="currentUserAnswer">
          <div class="quiz-question__variants">
            <div
              class="quiz-question__variants-item"
              v-for="(variant, index) of variants_of_answer"
              :key="variant + index"
            >
              <input
                type="radio"
                :name="variant + index"
                :value="variant"
                v-model="currentUserAnswer.answer_text"
              />
              <label :for="variant + index">{{ variant }}</label>
            </div>
          </div>
          <div
            class="quiz-question__result"
          >
            Is correct : {{ currentUserAnswer.is_correct }}
          </div>
          <div
            class="quiz-question__result"
          >
            Your Answer : {{ currentUserAnswer.answer_text }}
          </div>
          <button
            class="quiz-question__retry"
            type="button"
            @click="onRetry"
          >
            Retry
          </button>
        </div>
        <div v-else>
          <div class="quiz-question__variants">
            <div
              class="quiz-question__variants-item"
              v-for="(variant, index) of variants_of_answer"
              :key="variant + index"
            >
              <input
                type="radio"
                :name="variant + index"
                :value="variant"
                v-model="user_answer"
              />
              <label :for="variant + index">{{ variant }}</label>
            </div>
          </div>
          <button
            class="quiz-question__submit"
            type="button"
            @click="onSubmitAnswer"
          >
            Submit
          </button>
        </div>
      </div>
      <div @click="onNextQuestion" v-show="checkOnNextQuestion()" class="quiz-question__next-btn" />
    </div>

    <modal-window v-if="showEdit" @close-window="onToggleEdit">
      <EditQuiz
        :questions="quizQuestions"
        @updated-question="onUpdatedQuestion"
        @add-new-question="onAddNewQuestion"
        @close-window="onToggleEdit"
        @delete-question="onDeleteQuestion"
      />
    </modal-window>
  </div>
</template>

<style lang="scss">
.quiz {
  &-container {
    position: relative;
  }

  &-question {
    position: relative;
    width: 95%;

    &__container {
      padding: 1em;
      box-shadow: 0 0.5rem 1rem rgb(0 3 1 / 15%);
    }

    &__number {
      letter-spacing: 2px;
      font-weight: 700;
      font-size: 20px;
      margin-bottom: 15px;
    }

    &__description {
      border: 1px solid #000;
      border-radius: 6px;
      padding: 1em;
      margin-bottom: 15px;
    }

    &__variants {
      margin-bottom: 15px;

      &-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 5px;

        input[type=radio] {
          margin-right: 10px;

          &:hover {
            cursor: pointer;
          }
        }

        label {
          flex: auto;
          font-weight: 600;
        }
      }
    }

    &__result {
      font-weight: 700;
      text-transform: capitalize;
      margin-bottom: 10px;
    }

    &__retry,
    &__submit {
      background-color: #F19436;
      color: #fff;
      border-radius: 6px;
      padding: 10px 15px;
    }

    &__prev-btn,
    &__next-btn {
      cursor: pointer;
      position: absolute;
      width: 30px;
      height: 30px;
      top: 50%;
      transform: translateY(-50%);
      border-top: 2px solid #000;
      border-left: 2px solid #000;
      transition: transform 0.3s linear;
    }

    &__prev-btn {
      transform: rotate(-45deg);
      left: -30px;

      &:hover {
        transform: rotate(-45deg) scale(1.2);
      }
    }

    &__next-btn {
      transform: rotate(135deg);
      right: -30px;

      &:hover {
        transform: rotate(135deg) scale(1.2);
      }
    }
  }

  &-admin {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;

    p {
      margin-bottom: 0;
    }

    &__btn {
      background-color: #42484E;
      transition: background .15s ease, color .15s ease, box-shadow .15s ease, border-color .15s ease, opacity .15s ease;
      border-width: 1px;
      border-style: solid;
      border-radius: 6px;
      outline: none;
      border-color: transparent;
      color: #fff;
      padding: 1px 15px;
      font-size: 14px;

      &:hover {
        background-color: hsl(210, 7.33%, 24.24%);
      }
    }
  }
}
</style>
