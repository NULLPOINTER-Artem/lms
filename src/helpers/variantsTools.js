export function variantsToString(variants) {
  return variants.map((variant) => variant.replaceAll(' ', '_')).join(' ');
}

export function variantsToArray(variants) {
  return variants.split(' ').map((variant) => variant.replaceAll('_', ' '));
}
