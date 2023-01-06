import { RESOLVER_TYPES } from './common.js';

// Mutation patterns

function generateMutation__entry_type_create(configMutation) {
  return `
    mutation ${configMutation.operationName}(
      ${configMutation.variables}
    ) {
      entry_type_create(
        where: ${configMutation.where}
        data: ${configMutation.data}
      )
      ${configMutation.responseBody}
    }
  `;
}

function generateMutation__entry_types_update(configMutation) {
  return `
    mutation ${configMutation.operationName}(
      ${configMutation.variables}
    ) {
      entry_types_update(
        where: ${configMutation.where}
        data: ${configMutation.data}
      )
      ${configMutation.responseBody}
    }
  `;
}

function generateMutation__element_create(configMutation) {
  return `
    mutation ${configMutation.operationName}(
      ${configMutation.variables}
    ) {
      element_create(
        where: ${configMutation.where}
        data: ${configMutation.data}
      )
      ${configMutation.responseBody}
    }
  `;
}

function generateMutation__entries_create(configMutation) {
  return `
    mutation ${configMutation.operationName}(
      ${configMutation.variables}
    ) {
      entries_create(
        where: ${configMutation.where}
        data: ${configMutation.data}
      )
      ${configMutation.responseBody}
    }
  `;
}

function generateMutation__entries_delete(configMutation) {
  return `
    mutation ${configMutation.operationName}(
      ${configMutation.variables}
    ) {
      entries_delete(
        where: ${configMutation.where}
        permanent_deletion: ${configMutation.permanent_deletion}
      )
    }
  `;
}

function generateMutation__entries_update(configMutation) {
  return `
    mutation ${configMutation.operationName}(
      ${configMutation.variables}
    ) {
      entries_update(
        where: ${configMutation.where}
        data: ${configMutation.data}
      )
      ${configMutation.responseBody}
    }
  `;
}

// Mutation pattern types with responding function
const mutationPatternTypes = {
  [RESOLVER_TYPES.entry_type_create]: generateMutation__entry_type_create,
  [RESOLVER_TYPES.entry_types_update]: generateMutation__entry_types_update,
  [RESOLVER_TYPES.element_create]: generateMutation__element_create,
  [RESOLVER_TYPES.entries_create]: generateMutation__entries_create,
  [RESOLVER_TYPES.entries_delete]: generateMutation__entries_delete,
  [RESOLVER_TYPES.entries_update]: generateMutation__entries_update,
}

/**
 * Main function for generating mutations
 *
 * configMutation: {
 *  type: String
 *  operationName: String
 *  variables: String
 *  where: String
 *  data?: String
 *  responseBody?: String
 *  permanent_deletion?: Boolean
 * }
*/
export function generateMutation(configMutation) {
  return mutationPatternTypes[configMutation.type](configMutation);
}
