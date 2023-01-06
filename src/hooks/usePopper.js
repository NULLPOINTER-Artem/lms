import { createPopper } from '@popperjs/core';

export default function usePopper() {
  const mapPoppers = new Map([]);

  function generateGetBoundingClientRect(x = 0, y = 0) {
    return () => ({
      width: 0,
      height: 0,
      top: y,
      right: x,
      bottom: y,
      left: x,
    });
  }

  function getAllPoppers() {
    return new Map(mapPoppers);
  }

  function deletePopper(keyInstance) {
    mapPoppers.delete(keyInstance);
  }

  function getPopper(keyInstance) {
    return mapPoppers.get(keyInstance);
  }

  function addPopper(keyInstance, {
    virtualTarget = null,
    target = null,
    popperEl = null,
    options = {}
  }) {
    const targetEl = virtualTarget ? virtualTarget : target;
    const instance = createPopper(targetEl, popperEl, { ...options });

    mapPoppers.set(keyInstance, {
      instance,
      virtualTarget,
      target,
      popperEl,
      options
    })
  }

  return {
    addPopper,
    deletePopper,
    getAllPoppers,
    generateGetBoundingClientRect,
    getPopper
  }
}
