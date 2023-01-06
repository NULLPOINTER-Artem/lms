export default function getParentElementWithClass(child, className) {
  // Check if the 'child' is TextNode then we have to get parent element of this TextNode
  if (child instanceof Text) child = child.parentElement;

  // Check itself
  if (child.classList.contains(className)) return child;

  // Check if we have reached the 'body' element &
  // the function will return 'false' this mean that the element do not exist in the DOM
  if (child.tagName === 'BODY') return false;

  const parent = child.parentElement;

  if (parent.classList.contains(className)) return parent;

  return getParentElementWithClass(parent, className);
}
