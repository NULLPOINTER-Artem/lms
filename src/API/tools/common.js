// Query pattern types
export const RESOLVER_TYPES = {
  roles: 'roles_project_get',

  // ENTRY TYPES
  entry_types: 'models_get',
  entry_type_create: 'model_create',
  entry_types_delete: 'models_delete',
  entry_types_update: 'models_update',

  // ELEMENTS
  elements: 'elements_get',
  element_create: 'element_create',
  elements_delete: 'elements_delete',
  elements_update: 'elements_update',

  // ENTRIES
  entries: 'entries_get',
  entries_create: 'entries_create',
  entries_delete: 'entries_delete',
  entries_update: 'entries_update',
}

// Common element getters

export const getRoleProjectGlobal = (additionFields = []) => {
  const defaultFields = [
    `
      id
      name {
        locale
        text_value
      }
    `,
    ...additionFields
  ];

  return `
    ... on RoleProjectGlobal {
      ${defaultFields.join('\n')}
    }
  `;
};

export const getRoleWorkspace = (additionFields = []) => {
  const defaultFields = [
    `
      id
      name {
        locale
        text_value
      }
    `,
    ...additionFields
  ];

  return `
    ... on RoleWorkspace {
      ${defaultFields.join('\n')}
    }
  `;
};

export const getElementValueUser = (additionFields = []) => {
  const defaultFields = [
    `
      id
      email
      first_name
      last_name
      role {
        ${getRoleProjectGlobal()}
        ${getRoleWorkspace()}
      }
    `,
    ...additionFields
  ];

  return `
    ... on ElementValueUser {
      users {
        ${defaultFields.join('\n')}
      }
    }
  `;
};

export const getElementValueBoolean = (additionFields = []) => {
  const defaultFields = [
    `
      boolean
    `,
    ...additionFields
  ];

  return `
    ... on ElementValueBoolean {
      ${defaultFields.join('\n')}
    }
  `;
};

export const getElementValueNumber = (additionFields = []) => {
  const defaultFields = [
    `
      number
    `,
    ...additionFields
  ];

  return `
    ... on ElementValueNumber {
      ${defaultFields.join('\n')}
    }
  `;
};

export const getElementValueText = (additionFields = []) => {
  const defaultFields = [
    `
      text {
        value
      }
    `,
    ...additionFields
  ];

  return `
    ... on ElementValueText {
      ${defaultFields.join('\n')}
    }
  `;
};

export const getElementValueEntry = (additionFields = []) => {
  const defaultFields = [
    `
      id
      created_at
      name {
        text_value
      }
    `,
    ...additionFields
  ];

  return `
    ... on ElementValueEntry {
      entries {
        ${defaultFields.join('\n')}
      }
    }
  `;
};

// Common templates to find elements

export const findElementValueUser = (api_name, whereInputBody) => {
  return `
    {
      api_name: ${api_name}
      value: {
        users: ${whereInputBody}
      }
    }
  `;
};

export const findElementValueEntry = (api_name, whereInputBody) => {
  return `
    {
      api_name: ${api_name}
      value: {
        entries: ${whereInputBody}
      }
    }
  `;
};

export const findElementValueText = (api_name, whereInputBody) => {
  return `
    {
      api_name: ${api_name}
      value: {
        text: ${whereInputBody}
      }
    }
  `;
};

// Common element setters

export const setElementValueUser = (whereBody, whereInputBody) => {
  return `
    {
      where: ${whereBody}
      value: {
        users: ${whereInputBody}
      }
    }
  `;
};

export const setElementValueEntry = (whereBody, elementValueInputEntry) => {
  return `
    {
      where: ${whereBody}
      value: ${elementValueInputEntry}
    }
  `;
};

export const setElementValueInputEntry = (whereInputBody) => {
  return {
    entries: whereInputBody
  }
};

export const setElementValueText = (whereBody, whereInputBody) => {
  return `
    {
      where: ${whereBody}
      value: {
        text: ${whereInputBody}
      }
    }
  `;
};

export const setElementValueBoolean = (whereBody, boolVal) => {
  return `
    {
      where: ${whereBody}
      value: {
        boolean: ${boolVal}
      }
    }
  `;
};

// numVal: String!
export const setElementValueNumber = (whereBody, numVal) => {
  return `
    {
      where: ${whereBody}
      value: {
        number: ${numVal}
      }
    }
  `;
};
