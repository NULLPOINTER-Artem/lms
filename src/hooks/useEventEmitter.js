import singleton_EventEmitter from '../helpers/eventEmitter.js';

export default function useEventEmitter() {
  return {
    ...singleton_EventEmitter
  }
}
