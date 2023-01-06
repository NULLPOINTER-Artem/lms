import { RESOLVER_TYPES } from './common.js';

// Query patterns

function generateQuery__entries(operationName, variables, where, responseBody) {
  return `
    query ${operationName}(${variables}) {
      entries_get(
        where: ${where}
      ) {
        total
        entries ${responseBody}
      }
    }
  `;
}

function generateQuery__roles_project_get(operationName, variables, where, responseBody) {
  return `
    query ${operationName}(
      ${variables}
    ) {
      roles_project_get(
        where: ${where}
      ) {
        total
        roles ${responseBody}
      }
    }
  `;
}

function generateQuery__entry_types(operationName, variables, where, responseBody) {
  return `
    query ${operationName}(
      ${variables}
    ) {
      models_get(
        where: ${where}
      ) {
        total
        models ${responseBody}
      }
    }
  `;
}

function generateQuery__elements(operationName, variables, where, responseBody) {
  return `
    query ${operationName}(
      ${variables}
    ) {
      elements_get(
        where: ${where}
      ) {
        total
        elements ${responseBody}
      }
    }
  `;
}

// Query pattern types with responding function
const queryTypes = {
  [RESOLVER_TYPES.roles]: generateQuery__roles_project_get,
  [RESOLVER_TYPES.entry_types]: generateQuery__entry_types,
  [RESOLVER_TYPES.elements]: generateQuery__elements,
  [RESOLVER_TYPES.entries]: generateQuery__entries
}

/**
 * Main function for generating queries
 *
 * configQuery: {
 *  type: String
 *  operationName: String
 *  variables: String
 *  where: String
 *  responseBody: String
 * }
*/
export function generateQuery(configQuery) {
  return queryTypes[configQuery.type](
    configQuery.operationName,
    configQuery.variables,
    configQuery.where,
    configQuery.responseBody
  );
}
