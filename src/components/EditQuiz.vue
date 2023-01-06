<script setup>
import { computed, defineProps, defineEmits, onMounted, ref, watch } from 'vue';
import { useClientHandle } from '@urql/vue';

// Helpers
import generateId from '../helpers/generateId.js';
import isEmptyObject from '../helpers/isEmptyObject.js';
import { variantsToArray, variantsToString } from '../helpers/variantsTools.js';

// Hooks
import useDebounce from '../hooks/useDebounce.js';
import useParseQuiz from "../hooks/useParseQuiz.js";

// API
import {
  mutationCreateQuestionBody,
  mutationUpdateQuestionBody,
  mutationDeleteQuestionBody,
  mutationDeleteUserAnswersBody
} from '../API/mutationBodies';

// Components
import Loader from './LoaderComponent.vue';
import AddIcon from './icons/AddIcon.vue';
import TrashIcon from './icons/TrashIcon.vue';

const props = defineProps({
  questions: {
    type: Array,
    required: true
  },
});
const emit = defineEmits(['add-new-question', 'close-window', 'delete-question', 'updated-question']);

// Global
const handleClient = useClientHandle();

// Non-reactive variables
let currentIndexChecked = null;

// Hooks
const { parseQuestion } = useParseQuiz();

// State
const questions = ref([]);
const load = ref(false);
const load_done = ref(false);
const selectedQuestion = ref({});

// Computes
const variants_of_answer = computed(() => {
  if (!isEmptyObject(selectedQuestion.value) && selectedQuestion.value.variants_of_answers) {
    return variantsToArray(selectedQuestion.value.variants_of_answers);
  }

  return [];
});

const mutationCreateQuestion = handleClient.useMutation(mutationCreateQuestionBody);
const mutationDeleteQuestion = handleClient.useMutation(mutationDeleteQuestionBody);
const mutationDeleteUserAnswers = handleClient.useMutation(mutationDeleteUserAnswersBody);
const mutationUpdateQuestion = handleClient.useMutation(mutationUpdateQuestionBody);

onMounted(() => {
  questions.value = JSON.parse(JSON.stringify(props.questions));
  selectedQuestion.value = questions.value[0];
});

watch(() => props.questions.length, () => {
  questions.value = JSON.parse(JSON.stringify(props.questions));

  if (questions.value.length) {
    selectedQuestion.value = questions.value[questions.value.length - 1];
    load.value = false;
  } else {
    selectedQuestion.value = {};
  }
});

function onSelectQuestion(question) {
  mutationUpdateQuestion.executeMutation({
    project_id: localStorage.getItem('project_id'),
    question_id: selectedQuestion.value.id,
    question_text: selectedQuestion.value.question,
    answer_variants: selectedQuestion.value.variants_of_answers,
    correct_answers: selectedQuestion.value.correct_answers
  }).then((response) => emit('updated-question', parseQuestion(response.data.entries_update[0])));

  selectedQuestion.value = questions.value.find((item) => item.id === question.id);
}

function onAddQuestion() {
  const newId = generateId(Math.floor(Math.random() * 7) + 1);
  const default_answer_variants = [
    "This is first option",
    "This is second option",
    "This is third option"
  ];
  const default_correct_variants = [
    ""
  ];

  load.value = true;

  mutationUpdateQuestion.executeMutation({
    project_id: localStorage.getItem('project_id'),
    question_id: selectedQuestion.value.id,
    question_text: selectedQuestion.value.question,
    answer_variants: selectedQuestion.value.variants_of_answers,
    correct_answers: selectedQuestion.value.correct_answers
  }).then((response) => {
    emit('updated-question', parseQuestion(response.data.entries_update[0]));

    mutationCreateQuestion.executeMutation({
      project_id: localStorage.getItem('project_id'),
      question_api_name: `question_api_name_${newId}`,
      variants_of_answers: variantsToString(default_answer_variants),
      correct_answers: variantsToString(default_correct_variants),
      question_text: '',
    }).then((response) => {
      emit('add-new-question', parseQuestion(response.data.entries_create[0]));
    });
  });
}

function onDone() {
  load_done.value = true;

  mutationUpdateQuestion.executeMutation({
    project_id: localStorage.getItem('project_id'),
    question_id: selectedQuestion.value.id,
    question_text: selectedQuestion.value.question,
    answer_variants: selectedQuestion.value.variants_of_answers,
    correct_answers: selectedQuestion.value.correct_answers
  }).then((response) => {
    const updatedQuestion = parseQuestion(response.data.entries_update[0]);
    emit('updated-question', updatedQuestion);

    load_done.value = false;
    emit('close-window');
  });
}

function onDeleteQuestion(question) {
  const question_id = question.id;
  const question_answers = question.elements
    .find((element) => element.api_name.includes('element__question_answers__entry')).value;

  if (question_answers && question_answers.length) {
    const answer_ids = question_answers.map((question_answer) => question_answer.id);

    mutationDeleteUserAnswers.executeMutation({
      project_id: localStorage.getItem('project_id'),
      answer_ids: answer_ids
    });
  }

  load.value = true;

  mutationDeleteQuestion.executeMutation({
    project_id: localStorage.getItem('project_id'),
    question_id: question_id
  })
    .then(() => emit('delete-question', question_id));
}

function onInputQuestion(e) {
  selectedQuestion.value.question = e.target.textContent;
}

function updateVariants(updated_variants = null) {
  if (updated_variants) {
    if (currentIndexChecked || currentIndexChecked === 0) {
      selectedQuestion.value.correct_answers = updated_variants[currentIndexChecked];
    }
    if (updated_variants.length === 0) {
      selectedQuestion.value.variants_of_answers = '';
    } else {
      selectedQuestion.value.variants_of_answers = variantsToString(updated_variants);
    }
  } else {
    if (variants_of_answer.value.length) {
      if (currentIndexChecked || currentIndexChecked === 0) {
        selectedQuestion.value.correct_answers = variants_of_answer.value[currentIndexChecked];
      }
      selectedQuestion.value.variants_of_answers = variantsToString(variants_of_answer.value);
    }
  }

  currentIndexChecked = null;
}

const debouncedUpdateVariants = useDebounce(updateVariants, 1000);

function onInputVariant(index, event) {
  if (selectedQuestion.value.correct_answers.includes(variants_of_answer.value[index])) {
    currentIndexChecked = index;
  }

  variants_of_answer.value[index] = event.target.textContent;
  debouncedUpdateVariants(variants_of_answer.value);
}

function onDeleteVariant(index) {
  if (selectedQuestion.value.correct_answers === variants_of_answer.value[index]) {
    if (index === 0 && variants_of_answer.value.length === 1) {
      selectedQuestion.value.correct_answers = '';
    } else if (index === 0 && variants_of_answer.value.length > 1) {
      selectedQuestion.value.correct_answers = variants_of_answer.value[index + 1];
    } else {
      selectedQuestion.value.correct_answers = variants_of_answer.value[index - 1];
    }
  }

  const copy_of_variants = [...variants_of_answer.value];
  copy_of_variants.splice(index, 1);

  updateVariants(copy_of_variants);
}

function onAddVariant() {
  if (selectedQuestion.value.variants_of_answers === '') {
    selectedQuestion.value.variants_of_answers = 'New_Variant';
  } else {
    selectedQuestion.value.variants_of_answers += ' New_Variant';
  }
}
</script>

<template>
  <div class="edit-quiz">
    <div class="edit-quiz__panel">
      <div
        class="edit-quiz__panel-btn"
        @click="onAddQuestion"
      >
        <button type="button">
          <AddIcon :size="16" />
          New Question
          <Loader :load="load" />
        </button>
      </div>
      <div class="edit-quiz__panel-title">
        Questions
      </div>
      <div class="edit-quiz__panel-container">
        <div
          class="edit-quiz__panel-item"
          v-for="(question, index) of questions"
          :key="question.id"
          @click="onSelectQuestion(question)"
        >
          <span class="edit-quiz__panel-item__text">{{ (index + 1) }}. {{ question.question }}</span>
          <button
            type="button"
            class="edit-quiz__panel-item__btn"
            @click="onDeleteQuestion(question)"
          >
            <TrashIcon
              :icon-options="{
                strokeColor: 'black',
                strokeWidth: '1.67',
                width: '17',
                height: '17',
                viewBox: '0 0 20 20'
              }"
            />
          </button>
        </div>
      </div>
    </div>
    <div v-if="!isEmptyObject(selectedQuestion)" class="question-editor">
      <div class="question-editor__question">
        <div class="question-editor__question-title">
          Question text
        </div>
        <div
          contenteditable="true"
          class="question-editor__question-content"
          @input="onInputQuestion"
        >
          {{ selectedQuestion.question }}
        </div>
      </div>
      <div class="question-editor__variants">
        <div class="question-editor__variants-correct">
          Correct : {{ selectedQuestion.correct_answers }}
        </div>
        <button
          type="button"
          class="question-editor__variants-add-btn"
          @click="onAddVariant"
        >
          <AddIcon :size="15" />
          New Variant
        </button>
        <div class="question-editor__variants-answer">
          <div
            class="variants__answer-item"
            v-for="(variant, index) of variants_of_answer"
            :key="variant + index"
          >
            <input
              contenteditable="true"
              type="radio"
              :name="variant + index"
              :value="variant"
              v-model="selectedQuestion.correct_answers"
            />
            <label contenteditable="true" :for="variant + index" @input="onInputVariant(index, $event)">{{ variant }}</label>
            <button
              type="button"
              class="variants__answer-item__btn"
              @click="onDeleteVariant(index)"
            >
              <TrashIcon
                :icon-options="{
                  strokeColor: 'black',
                  strokeWidth: '1.67',
                  width: '20',
                  height: '20',
                  viewBox: '0 0 20 20'
                }"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="edit-quiz__bottom-panel">
      <button
        type="button"
        class="edit-quiz__bottom-panel-btn"
        @click="onDone"
      >
        Done
        <Loader :load="load_done" />
      </button>
    </div>
  </div>
</template>

<style lang="scss">
.edit-quiz {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: auto 1fr auto;

  &__panel {
    border-right: 1px solid #000;
    padding: 1em;

    &-btn {
      margin-bottom: 15px;
      position: relative;

      button {
        width: 100%;
        background-color: #42484E;
        transition: background .15s ease, color .15s ease, box-shadow .15s ease, border-color .15s ease, opacity .15s ease;
        border-width: 1px;
        border-style: solid;
        border-radius: 6px;
        outline: none;
        border-color: transparent;
        color: #fff;
        padding: 10px 15px;

        svg {
          position: absolute;
          left: 12px;
          top: 53%;
          transform: translateY(-50%);
        }

        .loader {
          position: absolute;
          left: -25px;
          top: 30%;
        }

        &:hover {
          background-color: hsl(210, 7.33%, 24.24%);
        }
      }
    }

    &-title {
      font-weight: 700;
      margin-bottom: 15px;
    }

    &-item {
      margin-bottom: 10px;
      position: relative;

      &__text {
        max-width: 137px;
        max-height: 27px;
        display: inline-block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: pre;
      }

      &__btn {
        position: absolute;
        right: 10px;

        &:hover {
          transform: scale(1.1);
        }
      }
    }
  }

  &__bottom-panel {
    grid-column-start: 2;
    height: 70px;

    &-btn {
      display: block;
      margin: auto 0 auto auto;
      width: fit-content;
      background-color: #42484E;
      transition: background .15s ease, color .15s ease, box-shadow .15s ease, border-color .15s ease, opacity .15s ease;
      border-width: 1px;
      border-style: solid;
      border-radius: 6px;
      outline: none;
      border-color: transparent;
      color: #fff;
      padding: 10px 30px;
      position: relative;

      .loader {
        position: absolute;
        right: 5px;
        top: 30%;
        border-left: 1.1em solid #fff;
      }

      &:hover {
        background-color: hsl(210, 7.33%, 24.24%);
      }
    }
  }

  .question-editor {
    padding: 1em;

    &__question {
      margin-bottom: 15px;

      &-title {
        text-transform: capitalize;
        font-weight: 600;
        margin-bottom: 10px;
      }

      &-content {
        border: 1px solid #000;
        border-radius: 6px;
        padding: 1em;
      }
    }

    &__variants {
      &-correct {
        font-weight: 600;
        margin-bottom: 10px;
      }

      &-add-btn {
        margin-bottom: 15px;
        background-color: #42484E;
        transition: background .15s ease, color .15s ease, box-shadow .15s ease, border-color .15s ease, opacity .15s ease;
        border-width: 1px;
        border-style: solid;
        border-radius: 6px;
        outline: none;
        border-color: transparent;
        color: #fff;
        padding: 10px 15px;

        svg {
          margin-right: 7px;
        }

        &:hover {
          background-color: hsl(210, 7.33%, 24.24%);
        }
      }

      .variants__answer-item {
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

        &__btn {
          &:hover {
            transform: scale(1.1);
          }
        }
      }
    }
  }
}
</style>
