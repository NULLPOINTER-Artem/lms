import axios from './API/axios.config.js';
import {
  mutationCreateElementBody,
  mutationUpdateTypeElementsBody,
  mutationCreateTypeBody
} from './API/mutationBodies.js';
import {
  queryAllLearningPaths_BookingBody,
  queryAllCourses_BookingBody,
  queryAllLearningPathsFilteredByIds_BookingBody,
  queryAllCoursesFilteredByIds_BookingBody,
  queryAllCoursesByIds_BookingBody,
  queryAllLearningPathsByIds_BookingBody,
  queryAllEntryTypesOfProjectBody,
  queryAllElementsByApiNameBody,
  queryProjectRolesBody
} from './API/queryBodies.js';
import { useAPIStore } from './stores/APIStore';

// UTILS FOR GET PATH/COURSES

const getPaths = async (url) => {
  const response = await axios({
    url,
    method: 'POST',
    data: {
      operationName: 'queryAllLearningPaths_Booking',
      query: queryAllLearningPaths_BookingBody,
      variables: {
        project_id: localStorage.getItem('project_id'),
      }
    }
  });

  return response.data.data.entries_get.entries;
};

const getPathsByIds = async (ids, url) => {
  const response = await axios({
    url,
    method: 'POST',
    data: {
      operationName: 'queryAllLearningPathsByIds_Booking',
      query: queryAllLearningPathsByIds_BookingBody,
      variables: {
        project_id: localStorage.getItem('project_id'),
        path_ids: ids
      }
    }
  });

  return response.data.data.entries_get.entries;
};

const getPathsFilteredByIds = async (ids, url) => {
  const response = await axios({
    url,
    method: 'POST',
    data: {
      operationName: 'queryAllLearningPathsFilteredByIds_Booking',
      query: queryAllLearningPathsFilteredByIds_BookingBody,
      variables: {
        project_id: localStorage.getItem('project_id'),
        path_ids: ids
      }
    }
  });

  return response.data.data.entries_get.entries;
};

const getCourses = async (url) => {
  const response = await axios({
    url,
    method: 'POST',
    data: {
      operationName: 'queryAllCourses_Booking',
      query: queryAllCourses_BookingBody,
      variables: {
        project_id: localStorage.getItem('project_id'),
      }
    }
  });

  return response.data.data.entries_get.entries;
};

const getCoursesByIds = async (ids, url) => {
  const response = await axios({
    url,
    method: 'POST',
    data: {
      operationName: 'queryAllCoursesByIds_Booking',
      query: queryAllCoursesByIds_BookingBody,
      variables: {
        project_id: localStorage.getItem('project_id'),
        course_ids: ids
      }
    }
  });

  return response.data.data.entries_get.entries;
};

const getCoursesFilteredByIds = async (ids, url) => {
  const response = await axios({
    url,
    method: 'POST',
    data: {
      operationName: 'queryAllCoursesFilteredByIds_Booking',
      query: queryAllCoursesFilteredByIds_BookingBody,
      variables: {
        project_id: localStorage.getItem('project_id'),
        course_ids: ids
      }
    }
  });

  return response.data.data.entries_get.entries;
};

export const getPathsAndCourses = async (coursesAndPath_ids = []) => {
  try {
    const APIStore = useAPIStore();
    const url = `${APIStore.getDomainAPI()}${APIStore.getEndPointGraphQL()}`;

    if (coursesAndPath_ids.length) {
      const [paths, courses] = await Promise.all([
        getPathsFilteredByIds(coursesAndPath_ids, url),
        getCoursesFilteredByIds(coursesAndPath_ids, url)
      ]);

      return [...paths, ...courses];
    }

    const [paths, courses] = await Promise.all([
      getPaths(url),
      getCourses(url)
    ]);

    return [...paths, ...courses];
  } catch (err) {
    console.error(`Something went wrong : ${err}`);

    return [];
  }
}

export const getPathsAndCoursesByIds = async (coursesAndPath_ids) => {
  try {
    if (!coursesAndPath_ids) {
      throw new Error(
        '[getPathsAndCoursesByIds]: missed required parameter "coursesAndPath_ids": [String]'
      );
    }

    if (!coursesAndPath_ids.length) return [];

    const APIStore = useAPIStore();
    const url = `${APIStore.getDomainAPI()}${APIStore.getEndPointGraphQL()}`;

    const [paths, courses] = await Promise.all([
      getPathsByIds(coursesAndPath_ids, url),
      getCoursesByIds(coursesAndPath_ids, url)
    ]);

    return [...paths, ...courses];
  } catch (err) {
    console.error(`Something went wrong : ${err}`);

    return [];
  }
}

// UTILS FOR MIGRATION DB

async function getCurrentDBSchema(url) {
  const response = await axios({
    url,
    method: 'POST',
    data: {
      operationName: 'queryAllEntryTypesOfProject',
      query: queryAllEntryTypesOfProjectBody,
      variables: {
        project_id: localStorage.getItem('project_id')
      }
    }
  });
  return response.data.data.models_get.models;
}

// queryProjectRolesBody

async function getProjectRoles(url) {
  const response = await axios({
    url,
    method: 'POST',
    data: {
      operationName: 'queryProjectRoles',
      query: queryProjectRolesBody,
      variables: {
        project_id: localStorage.getItem('project_id')
      }
    }
  });
  return response.data.data.roles_project_get.roles;
}

async function setCorrectElementAttributes(element, url) {
  delete element.attributes.__typename;

  switch (element.element_type) {
    case 'Text': {
      // Prepare tabs-locale
      element.attributes.tabs = element.attributes.tabs
        .map((tabItem) => {
          return {
            name: tabItem.tab.name,
            tab_type: tabItem.tab.tab_type
          }
        });

      return {
        [element.element_type.toLowerCase()]: {
          ...element.attributes,
        }
      }
    }
    case 'Number': {
      return {
        [element.element_type.toLowerCase()]: {
          ...element.attributes,
        }
      }
    }
    case 'Entry': {
      console.log("case 'Entry': {");
      console.dir(element.attributes);
      const entry_api_name = element.attributes.models[0].api_name;

      return {
        [element.element_type.toLowerCase()]: {
          ...element.attributes,
          models: {
            add: {
              api_name: entry_api_name
            }
          }
        }
      }
    }
    case 'Boolean': {
      return {
        [element.element_type.toLowerCase()]: {
          ...element.attributes,
        }
      }
    }
    case 'User': {
      const projectRoles = await getProjectRoles(url);

      element.attributes.roles = {
        add: {
          id__in: projectRoles.map((role) => role.id)
        }
      };

      return {
        [element.element_type.toLowerCase()]: {
          ...element.attributes,
        }
      }
    }
    default: break;
  }
}

async function getElementsByApiNames(api_names, url) {
  if (api_names.length) {
    const response = await axios({
      url,
      method: 'POST',
      data: {
        operationName: 'queryAllElementsByApiName',
        query: queryAllElementsByApiNameBody,
        variables: {
          project_id: localStorage.getItem('project_id'),
          api_names
        }
      }
    });

    return response.data.data.elements_get.elements;
  } else {
    return [];
  }
}

async function createElementDB(element, url) {
  const data = {
    ...element,
    enabled: true,
    attributes: ( await setCorrectElementAttributes(element, url))
  };

  delete data.__typename;

  const response = await axios({
    url,
    method: 'POST',
    data: {
      operationName: 'mutationCreateElement',
      query: mutationCreateElementBody,
      variables: {
        project_id: localStorage.getItem('project_id'),
        data
      }
    }
  });

  return response.data.data.element_create;
}

async function updateTypeElements(type, elements, url) {
  const response = await axios({
    url,
    method: 'POST',
    data: {
      operationName: 'mutationUpdateTypeElements',
      query: mutationUpdateTypeElementsBody,
      variables: {
        project_id: localStorage.getItem('project_id'),
        type_api_name: type.api_name,
        element_api_names: elements.map((elementItem) => elementItem.api_name)
      }
    }
  });

  return response.data.data.entry_types_update[0];
}

async function createType(type, url) {
  const data = {
    enabled: true,
    name: type.name,
    api_name: type.api_name,
  };

  const response = await axios({
    url,
    method: 'POST',
    data: {
      operationName: 'mutationCreateType',
      query: mutationCreateTypeBody,
      variables: {
        project_id: localStorage.getItem('project_id'),
        data
      }
    }
  });

  return response.data.data.entry_type_create;
}

async function checkOnExistElements(elementsForQuery, elementsByApiNames, url) {
  let copyOfElementsForQuery = [...elementsForQuery];
  const elementsForCreate = [];

  for (const elementForQuery of copyOfElementsForQuery) {
    const foundElement = elementsByApiNames
      .find((elementItem) => elementItem.api_name.includes(elementForQuery.api_name));

    if (!foundElement) elementsForCreate.push(elementForQuery);
  }

  const elementsForCreate_api_names = elementsForCreate.map(
    (elementItem) => elementItem.api_name
  );
  copyOfElementsForQuery = copyOfElementsForQuery.filter(
    (elementItem) => !elementsForCreate_api_names.includes(elementItem.api_name)
  );

  return Promise.all(
    elementsForCreate.map((elementItem) => createElementDB(elementItem, url))
  ).then((createdElements) => [...copyOfElementsForQuery, ...createdElements]);
}

async function iterateOverTypes(currTypes, actualTypes, url) {
  for await (const actualType of actualTypes) {
    const foundCurrType = currTypes.find((typeItem) => typeItem.api_name.includes(actualType.api_name));
    const actualElements = actualType.elements;
    const elementsForQuery = [];

    for (const actualElement of actualElements) {
      const foundCurrElement = foundCurrType.elements.find(
        (elementItem) => elementItem.api_name.includes(actualElement.api_name)
      );

      if (!foundCurrElement) elementsForQuery.push(actualElement);
    }

    if (elementsForQuery.length) {
      const elementsByApiNames = await getElementsByApiNames(
        elementsForQuery.map((elementItem) => elementItem.api_name),
        url
      );

      if (elementsByApiNames.length) {
        const elementsForUpdateType = await checkOnExistElements(elementsForQuery, elementsByApiNames, url);
        await updateTypeElements(actualType, elementsForUpdateType, url);
      } else {
        const elementsForUpdateType = await Promise.all(
          elementsForQuery.map((elementItem) => createElementDB(elementItem, url))
        );

        await updateTypeElements(actualType, elementsForUpdateType, url);
      }
    }
  }
}

async function checkOnExistTypes(currTypes, actualTypes, url) {
  const typesForCreate = [];

  for (const actualType of actualTypes) {
    const foundCurrType = currTypes.find((typeItem) => typeItem.api_name.includes(actualType.api_name));
    if (!foundCurrType) typesForCreate.push(actualType);
  }

  return Promise.all(
    typesForCreate.map((typeItem) => createType(typeItem, url))
  );
}

export async function migrateDB() {
  const APIStore = useAPIStore();
  const url = `${APIStore.getDomainAPI()}${APIStore.getEndPointGraphQL()}`;

  const actualDBSchema = await import('./DB_Schema.json').then((res) => res.default);
  const currentDBSchema = await getCurrentDBSchema(url).then((res) => JSON.parse(JSON.stringify(res)));
  // Iterate over types and check on exist, if need - create and add to currDBSchema
  currentDBSchema.push(...(await checkOnExistTypes(currentDBSchema, actualDBSchema, url)));
  await iterateOverTypes(currentDBSchema, actualDBSchema, url);
  console.log('DB LMS Successfully Migrated!');
}
