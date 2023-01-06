export const regEntryElementApiName = /^element__([a-z]+_?[a-z]+_?)+__entry$/gi;

const ELEMENT_VALUES = {
  boolean: 'boolean',
  number: 'number',
  text: 'text',
  users: 'users',
  entries: 'entries'
}

export function getValueOfElement(element) {
  const result = {};

  for (const [key] of Object.entries(element.value)) {
    if (key === '__typename') continue; // skip '__typename'
    if (key === ELEMENT_VALUES.text) result.value = element.value[key][0].value;
    else result.value = element.value[key];
  }

  return {
    api_name: element.api_name,
    value: result.value ?? null
  };
}

export function getAllNonEntryElements(item) {
  const results = [];
  const nonEntryElements = item.elements.filter((element) => !element.api_name.match(regEntryElementApiName));

  for (const element of nonEntryElements) {
    if (isNullValue(element)) setDefaultValue(element);
    results.push(getValueOfElement(element));
  }

  return results;
}

export function getResultValueByApiName(results, api_name) {
  return results.find((result) => result.api_name.includes(api_name)).value;
}

export function getEntryElement(entryElement, parser) {
  if (isNullValue(entryElement) || !hasEntryValue(entryElement)) {
    setDefaultValue(entryElement);
    return getValueOfElement(entryElement);
  } else {
    return {
      api_name: entryElement.api_name,
      value: entryElement.value.entries
        .map((entry) => parser(entry))
    };
  }
}

export function isNullValue(element) {
  return !element.value;
}

export function hasEntryValue(element) {
  return element.value && element.value.entries;
}

export function setDefaultValue(element) {
  element.value = {};
}
