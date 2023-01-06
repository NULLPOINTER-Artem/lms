import { generateQuery } from './tools/generateQuery.js';
import {
  RESOLVER_TYPES,
  getElementValueEntry,
  getElementValueText,
  getElementValueNumber,
  getElementValueBoolean,
  getElementValueUser,
  findElementValueEntry,
  findElementValueUser,
  findElementValueText,
} from './tools/common.js';

export const queryUserInfoBody = `
  query queryUserInfo (
    $user_id: String!
  ) {
    user_get (
      data: {
        id: $user_id
      }
    ) {
      id
      workspaces {
        id
        name {
          text_value
        }
        projects {
          id
          name {
            text_value
          }
        }
      }
    }
  }
`;

export const queryProjectRolesBody = generateQuery({
  type: RESOLVER_TYPES.roles,
  operationName: 'queryProjectRoles',
  variables: `
    $project_id: String!
  `,
  where: `
    {
      project: {
        id: $project_id
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

// ---------------- LESSON ----------------

export const queryLessonsBody = generateQuery({
  type: RESOLVER_TYPES.entries,
  operationName: 'queryLessons',
  variables: `
    $project_id: String!
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      models: {
        model: {
          api_name: "entry_type__lessons"
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
        }
      }
    }
  `
});

export const queryLessonBody = generateQuery({
  type: RESOLVER_TYPES.entries,
  operationName: 'queryLesson',
  variables: `
    $project_id: String!
    $lesson_id: String!
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      models: {
        model: {
          api_name: "entry_type__lessons"
        }
      },
      id: $lesson_id
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

export const queryLessonsByIdsBody = generateQuery({
  type: RESOLVER_TYPES.entries,
  operationName: 'queryLessonsByIds',
  variables: `
    $project_id: String!
    $lesson_ids: [String!]
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      models: {
        model: {
          api_name: "entry_type__lessons"
        }
      },
      id__in: $lesson_ids
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

// ---------------- QUIZ ----------------

export const queryQuizBody = generateQuery({
  type: RESOLVER_TYPES.entries,
  operationName: 'queryQuiz',
  variables: `
    $project_id: String!
    $quiz_id: String!
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      models: {
        model: {
          api_name: "entry_type__quizzes"
        }
      },
      id: $quiz_id
    }
  `,
  responseBody: `
    {
      id
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
            `
          ])}
        }
      }
    }
  `
});

export const queryQuizzesByIdsBody = generateQuery({
  type: RESOLVER_TYPES.entries,
  operationName: 'queryQuizzesByIds',
  variables: `
    $project_id: String!
    $quiz_ids: [String!]
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      models: {
        model: {
          api_name: "entry_type__quizzes"
        }
      },
      id__in: $quiz_ids
    }
  `,
  responseBody: `
    {
      id
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
            `
          ])}
        }
      }
    }
  `
});

// ---------------- COURSES ----------------

export const queryCoursesBody = generateQuery({
  type: RESOLVER_TYPES.entries,
  operationName: '',
  variables: `
    $project_id: String!
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      models: {
        model: {
          api_name: "entry_type__courses"
        }
      },
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

export const queryCourseBody = generateQuery({
  type: RESOLVER_TYPES.entries,
  operationName: 'queryCourse',
  variables: `
    $project_id: String!
    $course_id: String!
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      models: {
        model: {
          api_name: "entry_type__courses"
        }
      },
      id: $course_id
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

export const queryLearningPathsForCoursesBody = generateQuery({
  type: RESOLVER_TYPES.entries,
  operationName: 'queryLearningPathsForCourses',
  variables: `
    $project_id: String!
    $course_ids: [String!]
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      models: {
        model: {
          api_name: "entry_type__learning_paths"
        }
      },
      elements: [
        ${findElementValueEntry(
          '"element__courses__entry"',
          `
            {
              id__in: $course_ids
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
        }
      }
    }
  `
});

// ---------------- LEARNING PATHS ----------------

export const queryLearningPathsBody = generateQuery({
  type: RESOLVER_TYPES.entries,
  operationName: 'queryLearningPaths',
  variables: `
    $project_id: String!
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      models: {
        model: {
          api_name: "entry_type__learning_paths"
        }
      },
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

export const queryLearningPathsForUserBody = generateQuery({
  type: RESOLVER_TYPES.entries,
  operationName: 'queryLearningPathsForUser',
  variables: `
    $project_id: String!
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      models: {
        model: {
          api_name: "entry_type__learning_paths"
        }
      },
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
                  ${getElementValueEntry([
                    `
                      elements {
                        api_name
                        value {
                          ${getElementValueEntry()}
                        }
                      }
                    `
                  ])}
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

export const queryLearningPathBody = generateQuery({
  type: RESOLVER_TYPES.entries,
  operationName: 'queryLearningPath',
  variables: `
    $project_id: String!
    $lp_id: String!
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      models: {
        model: {
          api_name: "entry_type__learning_paths"
        }
      },
      id: $lp_id
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

export const queryCoursesForSelectFilteredByLPCoursesBody = generateQuery({
  type: RESOLVER_TYPES.entries,
  operationName: 'queryCoursesForSelectFilteredByLPCourses',
  variables: `
    $project_id: String!
    $course_ids: [String!]
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      models: {
        model: {
          api_name: "entry_type__courses"
        }
      },
      id__not_in: $course_ids
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

export const queryCoursesForSelectInLPBody = generateQuery({
  type: RESOLVER_TYPES.entries,
  operationName: 'queryCoursesForSelectInLP',
  variables: `
    $project_id: String!
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      models: {
        model: {
          api_name: "entry_type__courses"
        }
      },
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

export const queryCourseForUserBody = generateQuery({
  type: RESOLVER_TYPES.entries,
  operationName: 'queryCourseForUser',
  variables: `
    $project_id: String!
    $course_id: String!
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      models: {
        model: {
          api_name: "entry_type__courses"
        }
      },
      id: $course_id
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
                  ${getElementValueEntry([
                    `
                      elements {
                        api_name
                        value {
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

export const queryAllCoursesForUserBody = generateQuery({
  type: RESOLVER_TYPES.entries,
  operationName: 'queryAllCoursesForUser',
  variables: `
    $project_id: String!
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      models: {
        model: {
          api_name: "entry_type__courses"
        }
      },
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
                  ${getElementValueEntry()}
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

export const queryAllCoursesForUserFilteredByLPCoursesBody = generateQuery({
  type: RESOLVER_TYPES.entries,
  operationName: 'queryAllCoursesForUserFilteredByLPCourses',
  variables: `
    $project_id: String!
    $course_ids: [String!]
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      models: {
        model: {
          api_name: "entry_type__courses"
        }
      },
      id__not_in: $course_ids
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
                  ${getElementValueEntry()}
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

// ---------------- USER PROGRESS ----------------

export const queryUserProgressBody = generateQuery({
  type: RESOLVER_TYPES.entries,
  operationName: 'queryUserProgress',
  variables: `
    $project_id: String!
    $user_id: String!
    $entry_id: String!
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
  responseBody: `
    {
      id
      elements {
        api_name
        value {
          ${getElementValueUser()}
          ${getElementValueNumber()}
          ${getElementValueText()}
        }
      }
    }
  `
});

export const queryUserProgressForUpdateBody = generateQuery({
  type: RESOLVER_TYPES.entries,
  operationName: 'queryUserProgressForUpdate',
  variables: `
    $project_id: String!
    $user_id: String!
    $entry_id: String!
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
  responseBody: `
    {
      id
      elements {
        api_name
        value {
          ${getElementValueUser()}
          ${getElementValueNumber()}
          ${getElementValueText()}
        }
      }
    }
  `
});

export const queryAllUserProgressBody = generateQuery({
  type: RESOLVER_TYPES.entries,
  operationName: 'queryAllUserProgress',
  variables: `
    $project_id: String!
    $user_id: String!
    $entry_ids: [String!]
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
              value__in: $entry_ids
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
        api_name
        value {
          ${getElementValueUser()}
          ${getElementValueNumber()}
          ${getElementValueText()}
        }
      }
    }
  `
});

export const queryAllUserProgressForUpdateBody = generateQuery({
  type: RESOLVER_TYPES.entries,
  operationName: 'queryAllUserProgressForUpdate',
  variables: `
    $project_id: String!
    $user_id: String!
    $entry_ids: [String!]
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
              value__in: $entry_ids
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
        api_name
        value {
          ${getElementValueUser()}
          ${getElementValueNumber()}
          ${getElementValueText()}
        }
      }
    }
  `
});

export const queryCourseByLessonIdBody = generateQuery({
  type: RESOLVER_TYPES.entries,
  operationName: 'queryCourseByLessonId',
  variables: `
    $project_id: String!
    $lesson_id: String!
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      models: {
        model: {
          api_name: "entry_type__courses"
        }
      },
      elements: [
        ${findElementValueEntry(
          '"element__sections__entry"',
          `
            {
              elements: [
                ${findElementValueEntry(
                  '"element__lessons__entry"',
                  `
                    {
                      id: $lesson_id
                    }
                  `
                )}
              ]
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

// ---------------- DB Migration ----------------

export const queryAllEntryTypesOfProjectBody = generateQuery({
  type: RESOLVER_TYPES.entry_types,
  operationName: 'queryAllEntryTypesOfProject',
  variables: `
    $project_id: String!
  `,
  where: `
    {
      project: {
        id: $project_id
      }
    }
  `,
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

export const queryAllElementsByApiNameBody = generateQuery({
  type: RESOLVER_TYPES.elements,
  operationName: 'queryAllElementsByApiName',
  variables: `
    $project_id: String!
    $api_names: [String!]
  `,
  where: `
    {
      project: {
        id: $project_id
      }
      api_name__in: $api_names
    }
  `,
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

// ----------------- For Roles/Users ------------------

export const queryAllLearningPaths_BookingBody = generateQuery({
  type: RESOLVER_TYPES.entries,
  operationName: 'queryAllLearningPaths_Booking',
  variables: `
    $project_id: String!
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      models: {
        model: {
          api_name: "entry_type__learning_paths"
        }
      },
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
          ${getElementValueEntry()}
        }
      }
    }
  `
});

export const queryAllLearningPathsByIds_BookingBody = generateQuery({
  type: RESOLVER_TYPES.entries,
  operationName: 'queryAllLearningPathsByIds_Booking',
  variables: `
    $project_id: String!
    $path_ids: [String!]
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      models: {
        model: {
          api_name: "entry_type__learning_paths"
        }
      },
      id__in: $path_ids
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
          ${getElementValueEntry()}
        }
      }
    }
  `
});

export const queryAllLearningPathsFilteredByIds_BookingBody = generateQuery({
  type: RESOLVER_TYPES.entries,
  operationName: 'queryAllLearningPathsFilteredByIds_Booking',
  variables: `
    $project_id: String!
    $path_ids: [String!]
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      models: {
        model: {
          api_name: "entry_type__learning_paths"
        }
      },
      id__not_in: $path_ids
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
          ${getElementValueEntry()}
        }
      }
    }
  `
});

export const queryAllCourses_BookingBody = generateQuery({
  type: RESOLVER_TYPES.entries,
  operationName: 'queryAllCourses_Booking',
  variables: `
    $project_id: String!
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      models: {
        model: {
          api_name: "entry_type__courses"
        }
      },
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
                }
              }
            `
          ])}
        }
      }
    }
  `
});

export const queryAllCoursesByIds_BookingBody = generateQuery({
  type: RESOLVER_TYPES.entries,
  operationName: 'queryAllCoursesByIds_Booking',
  variables: `
    $project_id: String!
    $course_ids: [String!]
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      models: {
        model: {
          api_name: "entry_type__courses"
        }
      },
      id__in: $course_ids
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
                }
              }
            `
          ])}
        }
      }
    }
  `
});

export const queryAllCoursesFilteredByIds_BookingBody = generateQuery({
  type: RESOLVER_TYPES.entries,
  operationName: 'queryAllCoursesFilteredByIds_Booking',
  variables: `
    $project_id: String!
    $course_ids: [String!]
  `,
  where: `
    {
      project: {
        id: $project_id
      },
      models: {
        model: {
          api_name: "entry_type__courses"
        }
      },
      id__not_in: $course_ids
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
                  ${getElementValueEntry()}
                }
              }
            `
          ])}
        }
      }
    }
  `
});
