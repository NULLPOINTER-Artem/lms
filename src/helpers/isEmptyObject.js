export default function isEmptyObject(obj) {
  // The loop will complete only one step if the 'obj' have at least one property
  for (const property in obj) return false;

  // Other wise the loop will not run never if the 'object' do not have any property
  // and the function return true
  return true;
}
