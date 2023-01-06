export default function createElementHTML(targetElement, options = {}) {
  // Check is the element an HTML element, other wise create it
  if (!(targetElement instanceof HTMLElement)) {
    targetElement = document.createElement(targetElement);
  } else {
    return targetElement;
  }

  // Init the created element attributes
  if (options.attributes) {
    for (const [key, value] of Object.entries(options.attributes)) {
      targetElement.setAttribute(key, value);
    }
  }

  // Delete it from the options object so you do not add 'options' attribute to the created element
  delete options.attributes;

  for (const [key, value] of Object.entries(options)) {
    if (key !== 'ElementChildren') targetElement[key] = value;
  }

  // Create or just add children HTML elements of the created element
  if (options.ElementChildren) {
    for (const [key, value] of Object.entries(options.ElementChildren)) {
      if (value instanceof HTMLElement) {
        targetElement.append(createElementHTML(value));
      } else {
        targetElement.append(createElementHTML(key, value));
      }
    }
  }

  return targetElement;
}
