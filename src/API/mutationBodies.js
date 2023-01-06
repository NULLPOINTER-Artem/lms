import {
  RESOLVER_TYPES,
  getElementValueEntry,
  getElementValueText,
  getElementValueUser,
  setElementValueText,
  setElementValueEntry,
  setElementValueUser,
  setElementValueBoolean,
  setElementValueNumber,
  findElementValueUser,
  findElementValueText,
  getElementValueBoolean,
  getElementValueNumber,
} from './tools/common.js';
import { generateMutation } from './tools/generateMutation.js';

// ---------------- LESSON ----------------

export const mutationCreateLessonBody = generateMutation({
  type: RESOLVER_TYPES.entries_create,
  operationName: 'mutationCreateLesson',
  variables: `
    $project_id: String!
    $lesson_api_name: String!
    $lesson_name: String!
    $lesson_description: String!
    $lesson_order_id: String!
  `,
  where: `
    {
      project: {
        id: $project_id
      }
    }
  `,
  data: `
    {
      api_name: $lesson_api_name,
      status: "Draft",
      name: [
        {
          locale: "en",
          text_value: $lesson_name
        }
      ],
      models: {
        add: {
          api_name: "entry_type__lessons"
        }
      },
      elements: [
        ${setElementValueText(
          `
            {
              api_name: "element__lesson_order__text"
            }
          `,
          `
            {
              nodes: {
                  tab: {
                      name: "en"
                  }
              }
              value: $lesson_order_id
            }
          `
        )}
        ,
        ${setElementValueText(
          `
            {
              api_name: "element__lesson_description__text"
            }
          `,
          `
            {
              nodes: {
                  tab: {
                      name: "en"
                  }
              }
              value: $lesson_description
            }
          `
        )}
      ]
    }
  `,
  responseBody: `
    {
      id
      name {
        text_value
      }
      elements {
        api_name
        value {
          ${getElementValueEntry()}
          ${getElementValueText()}
        }
      }
    }
  `
});

export const mutationUpdateLessonBody = generateMutation({
  type: RESOLVER_TYPES.entries_update,
  operationName: 'mutationUpdateLesson',
  variables: `
    $project_id: String!
    $lesson_id: String!
    $lesson_name: String!
    $lesson_pages: ElementValueInput!
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      id: $lesson_id
    }
  `,
  data: `
    {
      name: {
        locale: "en",
        text_value: $lesson_name
      }
      elements: [
        ${setElementValueEntry(
          `
            {
              api_name: "element__lesson_pages__entry"
            }
          `,
          `$lesson_pages`
        )}
      ]
    }
  `,
  responseBody: `
    {
      id
      created_at
      name {
        text_value
      }
      elements {
        api_name
        value {
          ${getElementValueEntry([
            `
              elements {
                api_name,
                value {
                  ${getElementValueEntry()}
                  ${getElementValueText()}
                }
              }
            `
          ])}
          ${getElementValueText()}
        }
      }
    }
  `
});

export const mutationUpdateLessonNameAndDescriptionBody = generateMutation({
  type: RESOLVER_TYPES.entries_update,
  operationName: 'mutationUpdateLessonNameAndDescriptionBody',
  variables: `
    $project_id: String!
    $lesson_id: String!
    $lesson_name: String!
    $lesson_description: String!
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      id: $lesson_id
    }
  `,
  data: `
    {
      name: {
        locale: "en",
        text_value: $lesson_name
      },
      elements: [
        ${setElementValueText(
          `
            {
              api_name: "element__lesson_description__text"
            }
          `,
          `
            {
              nodes: {
                  tab: {
                      name: "en"
                  }
              }
              value: $lesson_description
            }
          `
        )}
      ]
    }
  `,
  responseBody: `
    {
      id
      created_at
      name {
        text_value
      }
      elements {
        api_name
        value {
          ${getElementValueEntry([
            `
              elements {
                api_name,
                value {
                  ${getElementValueEntry()}
                  ${getElementValueText()}
                }
              }
            `
          ])}
          ${getElementValueText()}
        }
      }
    }
  `
});

export const mutationUpdateLessonOrderIdBody = generateMutation({
  type: RESOLVER_TYPES.entries_update,
  operationName: 'mutationUpdateLessonOrderId',
  variables: `
    $project_id: String!
    $lesson_id: String!
    $lesson_order_id: String!
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      id: $lesson_id
    }
  `,
  data: `
    {
      elements: [
        ${setElementValueText(
          `
            {
              api_name: "element__lesson_order__text"
            }
          `,
          `
            {
              nodes: {
                  tab: {
                      name: "en"
                  }
              }
              value: $lesson_order_id
            }
          `
        )}
      ]
    }
  `,
  responseBody: `
    {
      id
    }
  `
});

export const mutationUpdateLessonCategoriesBody = generateMutation({
  type: RESOLVER_TYPES.entries_update,
  operationName: 'mutationUpdateLessonCategories',
  variables: `
    $project_id: String!
    $lesson_id: String!
    $lesson_categories: ElementValueInput!
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      id: $lesson_id
    }
  `,
  data: `
    {
      elements: [
        ${setElementValueEntry(
          `
            {
              api_name: "element__lesson_categories__entry"
            }
          `,
          `$lesson_categories`
        )}
      ]
    }
  `,
  responseBody: `
    {
      id
      created_at
      name {
        text_value
      }
      elements {
        api_name
        value {
          ${getElementValueEntry([
            `
              elements {
                api_name,
                value {
                  ${getElementValueEntry()}
                  ${getElementValueText()}
                }
              }
            `
          ])}
          ${getElementValueText()}
        }
      }
    }
  `
});

export const mutationDeleteLessonBody = generateMutation({
  type: RESOLVER_TYPES.entries_delete,
  operationName: 'mutationDeleteLesson',
  variables: `
    $project_id: String!
    $lesson_id: String!
  `,
  where: `
    {
      project: {
        id: $project_id,
      },
      id: $lesson_id
    }
  `,
  permanent_deletion: 'true',
});

export const mutationDeleteLessonWithCategoriesBody = generateMutation({
  type: RESOLVER_TYPES.entries_delete,
  operationName: 'mutationDeleteLessonWithCategories',
  variables: `
    $project_id: String!
    $entry_ids: [String!]
  `,
  where: `
    {
      project: {
        id: $project_id,
      },
      id__in: $entry_ids
    }
  `,
  permanent_deletion: 'true',
});

export const mutationDeleteLessonsWithCategoriesBody = generateMutation({
  type: RESOLVER_TYPES.entries_delete,
  operationName: 'mutationDeleteLessonsWithCategories',
  variables: `
    $project_id: String!
    $entry_ids: [String!]
  `,
  where: `
    {
      project: {
        id: $project_id,
      },
      id__in: $entry_ids
    }
  `,
  permanent_deletion: 'true',
});

// ---------------- CATEGORIES ----------------

export const mutationCreateCategoryBody = generateMutation({
  type: RESOLVER_TYPES.entries_create,
  operationName: 'mutationCreateCategory',
  variables: `
    $project_id: String!
    $category_api_name: String!
    $category_name: String!
  `,
  where: `
    {
      project: {
        id: $project_id
      }
    }
  `,
  data: `
    {
      api_name: $category_api_name,
      status: "Draft",
      name: [
        {
          locale: "en",
          text_value: $category_name
        }
      ],
      models: {
        add: {
          api_name: "entry_type__categories"
        }
      }
    }
  `,
  responseBody: `
    {
      id
      name {
        text_value
      }
    }
  `
});

export const mutationDeleteCategoryBody = generateMutation({
  type: RESOLVER_TYPES.entries_delete,
  operationName: 'mutationDeleteCategory',
  variables: `
    $project_id: String!
    $category_id: String!
  `,
  where: `
    {
      project: {
        id: $project_id,
      },
      id: $category_id
    }
  `,
  permanent_deletion: 'true',
});

// ---------------- PAGE ----------------

export const mutationCreatePageBody = generateMutation({
  type: RESOLVER_TYPES.entries_create,
  operationName: 'mutationCreatePage',
  variables: `
    $project_id: String!
    $page_api_name: String!
    $page_name: String!
    $page_order_id: String!
    $html_content: String!
  `,
  where: `
    {
      project: {
        id: $project_id
      }
    }
  `,
  data: `
    {
      api_name: $page_api_name,
      status: "Draft",
      name: [
        {
          locale: "en",
          text_value: $page_name
        }
      ],
      models: {
        add: {
          api_name: "entry_type__lesson_pages"
        }
      },
      elements: [
        ${setElementValueText(
          `
            {
              api_name: "element__html_content__text"
            }
          `,
          `
            {
              nodes: {
                  tab: {
                      name: "en"
                  }
              }
              value: $html_content
            }
          `
        )}
        ${setElementValueText(
          `
            {
              api_name: "element__page_order__text"
            }
          `,
          `
            {
              nodes: {
                  tab: {
                      name: "en"
                  }
              }
              value: $page_order_id
            }
          `
        )}
      ]
    }
  `,
  responseBody: `
    {
      id
    }
  `
});

export const mutationUpdatePageBody = generateMutation({
  type: RESOLVER_TYPES.entries_update,
  operationName: 'mutationUpdatePage',
  variables: `
    $project_id: String!
    $page_id: String!
    $html_content: String!
    $page_name: String!
    $banner_data: String!
    $page_quizzes: ElementValueInput!
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      id: $page_id
    }
  `,
  data: `
    {
      name: {
        locale: "en",
        text_value: $page_name
      },
      elements: [
        ${setElementValueText(
          `
            {
              api_name: "element__html_content__text"
            }
          `,
          `
            {
              nodes: {
                  tab: {
                      name: "en"
                  }
              }
              value: $html_content
            }
          `
        )}
        ${setElementValueText(
          `
            {
              api_name: "element__page_banner__text"
            }
          `,
          `
            {
              nodes: {
                  tab: {
                      name: "en"
                  }
              }
              value: $banner_data
            }
          `
        )}
        ${setElementValueEntry(
          `
            {
              api_name: "element__quizzes__entry"
            }
          `,
          `$page_quizzes`
        )}
      ]
    }
  `,
  responseBody: `
    {
      id
    }
  `
});

export const mutationUpdatePageOrderIdBody = generateMutation({
  type: RESOLVER_TYPES.entries_update,
  operationName: 'mutationUpdatePageOrderId',
  variables: `
    $project_id: String!
    $page_id: String!
    $page_order_id: String!
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      id: $page_id
    }
  `,
  data: `
    {
      elements: [
        ${setElementValueText(
          `
            {
              api_name: "element__page_order__text"
            }
          `,
          `
            {
              nodes: {
                  tab: {
                      name: "en"
                  }
              }
              value: $page_order_id
            }
          `
        )}
      ]
    }
  `,
  responseBody: `
    {
      id
    }
  `
});

export const mutationUpdatePageQuizzesBody = generateMutation({
  type: RESOLVER_TYPES.entries_update,
  operationName: 'mutationUpdatePageQuizzes',
  variables: `
    $project_id: String!
    $page_id: String!
    $page_quizzes: ElementValueInput!
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      id: $page_id
    }
  `,
  data: `
    {
      elements: [
        ${setElementValueEntry(
          `
            {
              api_name: "element__quizzes__entry"
            }
          `,
          `$page_quizzes`
        )}
      ]
    }
  `,
  responseBody: `
    {
      id
    }
  `
});

export const mutationDeletePagesBody = generateMutation({
  type: RESOLVER_TYPES.entries_delete,
  operationName: 'mutationDeletePages',
  variables: `
    $project_id: String!
    $page_ids: [String!]
  `,
  where: `
    {
      project: {
        id: $project_id,
      },
      id__in: $page_ids
    }
  `,
  permanent_deletion: 'true',
});

// ---------------- QUIZ ----------------

export const mutationCreateQuizBody = generateMutation({
  type: RESOLVER_TYPES.entries_create,
  operationName: 'mutationCreateQuiz',
  variables: `
    $project_id: String!
    $quiz_api_name: String!
    $quiz_name: String!
    $quiz_questions: ElementValueInput!
  `,
  where: `
    {
      project: {
        id: $project_id
      }
    }
  `,
  data: `
    {
      api_name: $quiz_api_name,
      status: "Draft",
      name: [
        {
          locale: "en",
          text_value: $quiz_name
        }
      ],
      models: {
        add: {
          api_name: "entry_type__quizzes"
        }
      },
      elements: [
        ${setElementValueEntry(
          `
            {
              api_name: "element__questions__entry"
            }
          `,
          `$quiz_questions`
        )}
      ]
    }
  `,
  responseBody: `
    {
      id
      name {
        text_value
      }
      elements {
        api_name
        value {
          ${getElementValueEntry()}
        }
      }
    }
  `
});

export const mutationUpdateQuizBody = generateMutation({
  type: RESOLVER_TYPES.entries_update,
  operationName: 'mutationUpdateQuiz',
  variables: `
    $project_id: String!
    $quiz_id: String!
    $quiz_questions: ElementValueInput!
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      id: $quiz_id
    }
  `,
  data: `
    {
      elements: [
        ${setElementValueEntry(
          `
            {
              api_name: "element__questions__entry"
            }
          `,
          `$quiz_questions`
        )}
      ]
    }
  `,
  responseBody: `
    {
      id,
      api_name,
      name {
        text_value
      },
      elements {
        api_name,
        value {
          ${getElementValueEntry()}
          ${getElementValueText()}
        }
      }
    }
  `
});

export const mutationDeleteQuizzesWithAllEntriesBody = generateMutation({
  type: RESOLVER_TYPES.entries_delete,
  operationName: 'mutationDeleteQuizzesWithAllEntries',
  variables: `
    $project_id: String!
    $entry_ids: [String!]
  `,
  where: `
    {
      project: {
        id: $project_id,
      },
      id__in: $entry_ids
    }
  `,
  permanent_deletion: 'true',
});

// ---------------- QUESTIONS ----------------

export const mutationCreateQuestionBody = generateMutation({
  type: RESOLVER_TYPES.entries_create,
  operationName: 'mutationCreateQuestion',
  variables: `
    $project_id: String!
    $question_api_name: String!
    $question_text: String!
    $variants_of_answers: String!
    $correct_answers: String!
  `,
  where: `
    {
      project: {
        id: $project_id
      }
    }
  `,
  data: `
    {
      api_name: $question_api_name,
      status: "Draft",
      name: [
        {
          locale: "en",
          text_value: $question_text
        }
      ],
      models: {
        add: {
          api_name: "entry_type__questions"
        }
      },
      elements: [
        ${setElementValueText(
          `
            {
              api_name: "element__variants_of_answers__text"
            }
          `,
          `
            {
              nodes: {
                  tab: {
                      name: "en"
                  }
              }
              value: $variants_of_answers
            }
          `
        )}
        ,
        ${setElementValueText(
          `
            {
              api_name: "element__correct_answers__text"
            }
          `,
          `
            {
              nodes: {
                  tab: {
                      name: "en"
                  }
              }
              value: $correct_answers
            }
          `
        )}
      ]
    }
  `,
  responseBody: `
    {
      id
      created_at
      name {
        text_value
      }
      elements {
        api_name,
        value {
          ${getElementValueEntry([
            `
              elements {
                api_name
                value {
                  ${getElementValueUser()}
                  ${getElementValueText()}
                  ${getElementValueBoolean()}
                }
              }
            `
          ])}
          ${getElementValueText()}
        }
      }
    }
  `
});

export const mutationDeleteQuestionBody = generateMutation({
  type: RESOLVER_TYPES.entries_delete,
  operationName: 'mutationDeleteQuestion',
  variables: `
    $project_id: String!
    $question_id: String!
  `,
  where: `
    {
      project: {
        id: $project_id,
      },
      id: $question_id
    }
  `,
  permanent_deletion: 'true',
});

export const mutationUpdateQuestionBody = generateMutation({
  type: RESOLVER_TYPES.entries_update,
  operationName: 'mutationUpdateQuestion',
  variables: `
    $project_id: String!
    $question_id: String!
    $question_text: String!
    $answer_variants: String!
    $correct_answers: String!
  `,
  where: `
    {
      project: {
          id: $project_id
      },
      id: $question_id
    }
  `,
  data: `
    {
      name: {
        locale: "en",
        text_value: $question_text
      },
      elements: [
        ${setElementValueText(
          `
            {
              api_name: "element__correct_answers__text"
            }
          `,
          `
            {
              nodes: {
                  tab: {
                      name: "en"
                  }
              }
              value: $correct_answers
            }
          `
        )}
        ,
        ${setElementValueText(
          `
            {
              api_name: "element__variants_of_answers__text"
            }
          `,
          `
            {
              nodes: {
                  tab: {
                      name: "en"
                  }
              }
              value: $answer_variants
            }
          `
        )}
      ]
    }
  `,
  responseBody: `
    {
      id
      created_at
      name {
        text_value
      }
      elements {
        api_name,
        value {
          ${getElementValueEntry([
            `
              elements {
                api_name
                value {
                  ${getElementValueUser()}
                  ${getElementValueText()}
                  ${getElementValueBoolean()}
                }
              }
            `
          ])}
          ${getElementValueText()}
        }
      }
    }
  `
});

export const mutationUpdateQuestionAnswersBody = generateMutation({
  type: RESOLVER_TYPES.entries_update,
  operationName: 'mutationUpdateQuestionAnswers',
  variables: `
    $project_id: String!
    $question_id: String!
    $user_answers: ElementValueInput!
  `,
  where: `
    {
      project: {
          id: $project_id
      },
      id: $question_id
    }
  `,
  data: `
    {
      elements: [
        ${setElementValueEntry(
          `
            {
              api_name: "element__question_answers__entry"
            }
          `,
          `$user_answers`
        )}
      ]
    }
  `,
  responseBody: `
    {
      id
      created_at
      name {
        text_value
      }
      elements {
        api_name,
        value {
          ${getElementValueEntry([
            `
              elements {
                api_name
                value {
                  ${getElementValueUser()}
                  ${getElementValueText()}
                  ${getElementValueBoolean()}
                }
              }
            `
          ])}
          ${getElementValueText()}
        }
      }
    }
  `
});

// ---------------- QUESTION ANSWERS ----------------

export const mutationCreateUserAnswerBody = generateMutation({
  type: RESOLVER_TYPES.entries_create,
  operationName: 'mutationCreateUserAnswer',
  variables: `
    $project_id: String!
    $answer_api_name: String!
    $answer_name: String!
    $answers: String!
    $is_correct: Boolean!
    $user_id: String!
  `,
  where: `
    {
      project: {
        id: $project_id
      }
    }
  `,
  data: `
    {
      api_name: $answer_api_name,
      status: "Draft",
      name: [
        {
          locale: "en",
          text_value: $answer_name
        }
      ],
      models: {
        add: {
          api_name: "entry_type__question_answers"
        }
      },
      elements: [
        ${setElementValueUser(
          `
            {
              api_name: "element__user__user"
            }
          `,
          `
            {
              id: $user_id
            }
          `
        )}
        ,
        ${setElementValueBoolean(
          `
            {
              api_name: "element__is_correct__boolean"
            }
          `,
          `$is_correct`
        )}
        ,
        ${setElementValueText(
          `
            {
              api_name: "element__user_answers__text"
            }
          `,
          `
            {
              nodes: {
                  tab: {
                      name: "en"
                  }
              }
              value: $answers
            }
          `
        )}
      ]
    }
  `,
  responseBody: `
    {
      id
      elements {
        api_name,
        value {
          ${getElementValueUser()}
          ${getElementValueText()}
          ${getElementValueBoolean()}
        }
      }
    }
  `
});

export const mutationDeleteUserAnswerBody = generateMutation({
  type: RESOLVER_TYPES.entries_delete,
  operationName: 'mutationDeleteUserAnswer',
  variables: `
    $project_id: String!
    $answer_id: String!
  `,
  where: `
    {
      project: {
        id: $project_id,
      },
      models: {
        model: {
          api_name: "entry_type__question_answers"
        }
      },
      id: $answer_id
    }
  `,
  permanent_deletion: 'true',
});

export const mutationDeleteUserAnswersBody = generateMutation({
  type: RESOLVER_TYPES.entries_delete,
  operationName: 'mutationDeleteUserAnswers',
  variables: `
    $project_id: String!
    $answer_ids: [String!]
  `,
  where: `
    {
      project: {
        id: $project_id,
      },
      models: {
        model: {
          api_name: "entry_type__question_answers"
        }
      },
      id__in: $answer_ids
    }
  `,
  permanent_deletion: 'true',
});

// ---------------- COURSES ----------------

export const mutationCreateCourseBody = generateMutation({
  type: RESOLVER_TYPES.entries_create,
  operationName: 'mutationCreateCourse',
  variables: `
    $project_id: String!
    $course_api_name: String!
    $course_name: String!
  `,
  where: `
    {
      project: {
        id: $project_id
      }
    }
  `,
  data: `
    {
      api_name: $course_api_name,
      status: "Draft",
      name: [
        {
          locale: "en",
          text_value: $course_name
        }
      ],
      models: {
        add: {
          api_name: "entry_type__courses"
        }
      }
    }
  `,
  responseBody: `
    {
      id
      created_at
      name {
        text_value
      }
      elements {
        api_name
        value {
          ${getElementValueEntry([
            `
              elements {
                api_name,
                value {
                  ${getElementValueEntry()}
                  ${getElementValueText()}
                }
              }
            `
          ])}
          ${getElementValueText()}
          ${getElementValueNumber()}
        }
      }
    }
  `
});

export const mutationUpdateCourseBody = generateMutation({
  type: RESOLVER_TYPES.entries_update,
  operationName: 'mutationUpdateCourse',
  variables: `
    $project_id: String!
    $course_id: String!
    $course_name: String!
    $course_sections: ElementValueInput!
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      id: $course_id
    }
  `,
  data: `
    {
      name: {
        locale: "en",
        text_value: $course_name
      }
      elements: [
        ${setElementValueEntry(
          `
            {
              api_name: "element__sections__entry"
            }
          `,
          `$course_sections`
        )}
      ]
    }
  `,
  responseBody: `
    {
      id
      created_at
      name {
        text_value
      }
      elements {
        api_name
        value {
          ${getElementValueEntry([
            `
              elements {
                api_name,
                value {
                  ${getElementValueEntry([
                    `
                      elements {
                        api_name
                        value {
                          ${getElementValueEntry([
                            `
                              elements {
                                api_name,
                                value {
                                  ${getElementValueEntry()}
                                  ${getElementValueText()}
                                }
                              }
                            `
                          ])}
                          ${getElementValueText()}
                        }
                      }
                    `
                  ])}
                  ${getElementValueText()}
                }
              }
            `
          ])}
          ${getElementValueText()}
          ${getElementValueNumber()}
        }
      }
    }
  `
});

export const mutationUpdateCourseSettingsBody = generateMutation({
  type: RESOLVER_TYPES.entries_update,
  operationName: 'mutationUpdateCourseSettings',
  variables: `
    $project_id: String!
    $course_id: String!
    $role_id: String!
    $course_name: String!
    $course_description: String!
    $course_duration: String!
    $course_banner: String!
    $course_banner_name: String!
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      id: $course_id
    }
  `,
  data: `
    {
      name: {
        locale: "en",
        text_value: $course_name
      }
      elements: [
        ${setElementValueText(
          `
            {
              api_name: "element__course_role_id__text"
            }
          `,
          `
            {
              nodes: {
                  tab: {
                      name: "en"
                  }
              }
              value: $role_id
            }
          `
        )}
        ,
        ${setElementValueText(
          `
            {
              api_name: "element__course_description__text"
            }
          `,
          `
            {
              nodes: {
                  tab: {
                      name: "en"
                  }
              }
              value: $course_description
            }
          `
        )}
        ,
        ${setElementValueNumber(
          `
            {
              api_name: "element__course_duration__number"
            }
          `,
          `$course_duration`
        )}
        ,
        ${setElementValueText(
          `
            {
              api_name: "element__course_banner__text"
            }
          `,
          `
            {
              nodes: {
                  tab: {
                      name: "en"
                  }
              }
              value: $course_banner
            }
          `
        )}
        ,
        ${setElementValueText(
          `
            {
              api_name: "element__course_banner_name__text"
            }
          `,
          `
            {
              nodes: {
                  tab: {
                      name: "en"
                  }
              }
              value: $course_banner_name
            }
          `
        )}
      ]
    }
  `,
  responseBody: `
    {
      id
      created_at
      name {
        text_value
      }
      elements {
        api_name
        value {
          ${getElementValueEntry([
            `
              elements {
                api_name,
                value {
                  ${getElementValueEntry()}
                  ${getElementValueText()}
                }
              }
            `
          ])}
          ${getElementValueText()}
          ${getElementValueNumber()}
        }
      }
    }
  `
});

export const mutationDeleteCourseBody = generateMutation({
  type: RESOLVER_TYPES.entries_delete,
  operationName: 'mutationDeleteCourse',
  variables: `
    $project_id: String!
    $course_id: String!
  `,
  where: `
    {
      project: {
        id: $project_id,
      },
      id: $course_id
    }
  `,
  permanent_deletion: 'true',
});

// ---------------- SECTIONS ----------------

export const mutationCreateSectionBody = generateMutation({
  type: RESOLVER_TYPES.entries_create,
  operationName: 'mutationCreateSection',
  variables: `
    $project_id: String!
    $section_api_name: String!
    $section_name: String!
    $section_description: String!,
    $section_lessons: ElementValueInput!
  `,
  where: `
    {
      project: {
        id: $project_id
      }
    }
  `,
  data: `
    {
      api_name: $section_api_name,
      status: "Draft",
      name: [
        {
          locale: "en",
          text_value: $section_name
        }
      ],
      models: {
        add: {
          api_name: "entry_type__sections"
        }
      },
      elements: [
        ${setElementValueEntry(
          `
            {
              api_name: "element__lessons__entry"
            }
          `,
          `$section_lessons`
        )}
        ,
        ${setElementValueText(
          `
            {
              api_name: "element__section_description__text"
            }
          `,
          `
            {
              nodes: {
                  tab: {
                      name: "en"
                  }
              }
              value: $section_description
            }
          `
        )}
      ]
    }
  `,
  responseBody: `
    {
      id
      created_at
      name {
        text_value
      }
      elements {
        api_name,
        value {
          ${getElementValueEntry()}
          ${getElementValueText()}
        }
      }
    }
  `
});

export const mutationUpdateSectionBody = generateMutation({
  type: RESOLVER_TYPES.entries_update,
  operationName: 'mutationUpdateSection',
  variables: `
    $project_id: String!
    $section_id: String!
    $section_name: String!
    $section_description: String!
    $section_lessons: ElementValueInput!
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      id: $section_id
    }
  `,
  data: `
    {
      name: {
        locale: "en",
        text_value: $section_name
      }
      elements: [
        ${setElementValueText(
          `
            {
              api_name: "element__section_description__text"
            }
          `,
          `
            {
              nodes: {
                  tab: {
                      name: "en"
                  }
              }
              value: $section_description
            }
          `
        )}
        ,
        ${setElementValueEntry(
          `
            {
              api_name: "element__lessons__entry"
            }
          `,
          `$section_lessons`
        )}
      ]
    }
  `,
  responseBody: `
    {
      id
      created_at
      name {
        text_value
      }
      elements {
        api_name,
        value {
          ${getElementValueEntry([
            `
              elements {
                api_name
                value {
                  ${getElementValueEntry([
                    `
                      elements {
                        api_name,
                        value {
                          ${getElementValueEntry()}
                          ${getElementValueText()}
                        }
                      }
                    `
                  ])}
                  ${getElementValueText()}
                }
              }
            `
          ])}
          ${getElementValueText()}
        }
      }
    }
  `
});

export const mutationDeleteSectionsBody = generateMutation({
  type: RESOLVER_TYPES.entries_delete,
  operationName: 'mutationDeleteSections',
  variables: `
    $project_id: String!
    $section_ids: [String!]
  `,
  where: `
    {
      project: {
        id: $project_id,
      },
      id__in: $section_ids
    }
  `,
  permanent_deletion: 'true',
});

// ---------------- LEARNING PATHS ----------------

export const mutationCreateLearningPathBody = generateMutation({
  type: RESOLVER_TYPES.entries_create,
  operationName: 'mutationCreateLearningPath',
  variables: `
    $project_id: String!
    $lp_api_name: String!
    $lp_name: String!
    $lp_description: String!
  `,
  where: `
    {
      project: {
        id: $project_id
      }
    }
  `,
  data: `
    {
      api_name: $lp_api_name,
      status: "Draft",
      name: [
        {
          locale: "en",
          text_value: $lp_name
        }
      ],
      models: {
        add: {
          api_name: "entry_type__learning_paths"
        }
      },
      elements: [
        ${setElementValueText(
          `
            {
              api_name: "element__lp_description__text"
            }
          `,
          `
            {
              nodes: {
                  tab: {
                      name: "en"
                  }
              }
              value: $lp_description
            }
          `
        )}
      ]
    }
  `,
  responseBody: `
    {
      id
      created_at
      name {
        text_value
      }
      elements {
        api_name
        value {
          ${getElementValueEntry([
            `
              elements {
                api_name
                value {
                  ${getElementValueText()}
                  ${getElementValueNumber()}
                }
              }
            `
          ])}
          ${getElementValueText()}
        }
      }
    }
  `
});

export const mutationDeleteLearningPathBody = generateMutation({
  type: RESOLVER_TYPES.entries_delete,
  operationName: 'mutationDeleteLearningPath',
  variables: `
    $project_id: String!
    $lp_id: String!
  `,
  where: `
    {
      project: {
        id: $project_id,
      },
      id: $lp_id
    }
  `,
  permanent_deletion: 'true',
});

export const mutationUpdateLearningPathBody = generateMutation({
  type: RESOLVER_TYPES.entries_update,
  operationName: 'mutationUpdateLearningPath',
  variables: `
    $project_id: String!
    $lp_id: String!
    $lp_name: String!
    $lp_description: String!
    $lp_courses: ElementValueInput!
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      id: $lp_id
    }
  `,
  data: `
    {
      name: {
        locale: "en",
        text_value: $lp_name
      }
      elements: [
        ${setElementValueText(
          `
            {
              api_name: "element__lp_description__text"
            }
          `,
          `
            {
              nodes: {
                  tab: {
                      name: "en"
                  }
              }
              value: $lp_description
            }
          `
        )}
        ,
        ${setElementValueEntry(
          `
            {
              api_name: "element__courses__entry"
            }
          `,
          `$lp_courses`
        )}
      ]
    }
  `,
  responseBody: `
    {
      id
      created_at
      name {
        text_value
      }
      elements {
        api_name
        value {
          ${getElementValueEntry([
            `
              elements {
                api_name
                value {
                  ${getElementValueText()}
                  ${getElementValueNumber()}
                }
              }
            `
          ])}
          ${getElementValueText()}
        }
      }
    }
  `
});

export const mutationUpdateCourseOrderBody = generateMutation({
  type: RESOLVER_TYPES.entries_update,
  operationName: 'mutationUpdateCourseOrder',
  variables: `
    $project_id: String!
    $course_id: String!
    $course_order: String!
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      id: $course_id
    }
  `,
  data: `
    {
      elements: [
        ${setElementValueText(
          `
            {
              api_name: "element__course_order__text"
            }
          `,
          `
            {
              nodes: {
                  tab: {
                      name: "en"
                  }
              }
              value: $course_order
            }
          `
        )}
      ]
    }
  `,
  responseBody: `
    {
      id
      name {
        text_value
      }
      elements {
        api_name
        value {
          ${getElementValueText()}
          ${getElementValueNumber()}
        }
      }
    }
  `
});

// ---------------- USER PROGRESS ----------------

export const mutationUpdateUserProgressBody = generateMutation({
  type: RESOLVER_TYPES.entries_update,
  operationName: 'mutationUpdateUserProgress',
  variables: `
    $project_id: String!
    $user_id: String!
    $entry_id: String!
    $record: String!
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      models: {
        model: {
          api_name: "entry_type__user_progress"
        }
      },
      elements: [
        ${findElementValueUser(
          '"element__user__user"',
          `
            {
              id: $user_id
            }
          `
        )}
        ,
        ${findElementValueText(
          '"element__current_entry_id__text"',
          `
            {
              value: $entry_id
            }
          `
        )}
      ]
    }
  `,
  data: `
    {
      elements: [
        ${setElementValueNumber(
          `
            {
              api_name: "element__progress_percent__number"
            }
          `,
          `$record`
        )}
      ]
    }
  `,
  responseBody: `
    {
      id
    }
  `
});

export const mutationCreateUserProgressBody = generateMutation({
  type: RESOLVER_TYPES.entries_create,
  operationName: 'mutationCreateUserProgress',
  variables: `
    $project_id: String!
    $progress_api_name: String!
    $progress_name: String!
    $user_id: String!
    $entry_id: String!
    $record: String!
  `,
  where: `
    {
      project: {
        id: $project_id
      }
    }
  `,
  data: `
    {
      api_name: $progress_api_name,
      status: "Draft",
      name: [
        {
          locale: "en",
          text_value: $progress_name
        }
      ],
      models: {
        add: {
          api_name: "entry_type__user_progress"
        }
      },
      elements: [
        ${setElementValueUser(
          `
            {
              api_name: "element__user__user"
            }
          `,
          `
            {
              id: $user_id
            }
          `
        )}
        ,
        ${setElementValueText(
          `
            {
              api_name: "element__current_entry_id__text"
            }
          `,
          `
            {
              nodes: {
                  tab: {
                      name: "en"
                  }
              }
              value: $entry_id
            }
          `
        )}
        ,
        ${setElementValueNumber(
          `
            {
              api_name: "element__progress_percent__number"
            }
          `,
          `$record`
        )}
      ]
    }
  `,
  responseBody: `
    {
      id
    }
  `
});

export const mutationDeleteUserProgressBody = generateMutation({
  type: RESOLVER_TYPES.entries_delete,
  operationName: 'mutationDeleteUserProgress',
  variables: `
    $project_id: String!
    $user_id: String!
    $entry_id: String!
  `,
  where: `
    {
      project: {
        id: $project_id,
      },
      models: {
        model: {
          api_name: "entry_type__user_progress"
        }
      },
      elements: [
        ${findElementValueUser(
          '"element__user__user"',
          `
            {
              id: $user_id
            }
          `
        )}
        ,
        ${findElementValueText(
          '"element__current_entry_id__text"',
          `
           {
            value: $entry_id
           }
          `
        )}
      ]
    }
  `,
  permanent_deletion: 'true',
});

export const mutationDeleteAllUserProgressBody = generateMutation({
  type: RESOLVER_TYPES.entries_delete,
  operationName: 'mutationDeleteAllUserProgress',
  variables: `
    $project_id: String!
    $user_id: String!
    $entry_ids: [String!]
  `,
  where: `
    {
      project: {
        id: $project_id,
      },
      models: {
        model: {
          api_name: "entry_type__user_progress"
        }
      },
      elements: [
        ${findElementValueUser(
          '"element__user__user"',
          `
            {
              id: $user_id
            }
          `
        )}
        ,
        ${findElementValueText(
          '"element__current_entry_id__text"',
          `
           {
            value__in: $entry_ids
           }
          `
        )}
      ]
    }
  `,
  permanent_deletion: 'true',
});

// ---------------- DB Migration ----------------

export const mutationCreateElementBody = generateMutation({
  type: RESOLVER_TYPES.element_create,
  operationName: 'mutationCreateElement',
  variables: `
    $project_id: String!
    $data: ElementData!
  `,
  where: `
    {
      project: {
        id: $project_id
      }
    }
  `,
  data: `$data`,
  responseBody: `
    {
      api_name
      name {
        locale
        text_value
      }
      element_type
      attributes {
        ... on ElementAttrsEntry {
          models {
            api_name
          }
          quantity_limit_min
          quantity_limit_max
          optional
        }
        ... on ElementAttrsUser {
          quantity_limit_min
          quantity_limit_max
          optional
        }
        ... on ElementAttrsBoolean {
          default_value
        }
        ... on ElementAttrsText {
          text_editor_type
          text_format
          character_limit_min
          character_limit_max
          optional
          tabs {
            tab {
              name
              tab_type
            }
          }
        }
        ... on ElementAttrsNumber {
          req_int
          optional
        }
      }
    }
  `
});

export const mutationCreateTypeBody = generateMutation({
  type: RESOLVER_TYPES.entry_type_create,
  operationName: 'mutationCreateType',
  variables: `
    $project_id: String!
    $data: EntryTypeData!
  `,
  where: `
    {
      project: {
        id: $project_id
      }
    }
  `,
  data: `$data`,
  responseBody: `
    {
      api_name
      name {
        locale
        text_value
      }
      elements {
        api_name
        name {
          locale
          text_value
        }
        element_type
        attributes {
          ... on ElementAttrsEntry {
            models {
              api_name
            }
            quantity_limit_min
            quantity_limit_max
            optional
          }
          ... on ElementAttrsUser {
            quantity_limit_min
            quantity_limit_max
            optional
          }
          ... on ElementAttrsBoolean {
            default_value
          }
          ... on ElementAttrsText {
            text_editor_type
            text_format
            character_limit_min
            character_limit_max
            optional
            tabs {
              tab {
                name
                tab_type
              }
            }
          }
          ... on ElementAttrsNumber {
            req_int
            optional
          }
        }
      }
    }
  `
});

export const mutationUpdateTypeElementsBody = generateMutation({
  type: RESOLVER_TYPES.entry_types_update,
  operationName: 'mutationUpdateTypeElements',
  variables: `
    $project_id: String!
    $type_api_name: String!
    $element_api_names: [String!]
  `,
  where: `
    {
      project: {
        id: $project_id
      }
      api_name: $type_api_name
    }
  `,
  data: `
    {
      elements: {
        add: {
          api_name__in: $element_api_names
        }
      }
    }
  `,
  responseBody: `
    {
      id
      api_name
    }
  `
});
