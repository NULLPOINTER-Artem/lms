<script setup>
import { toRefs } from 'vue';

// Components
import CompletedIcon from './icons/CompletedIcon.vue';

const defineProps = defineProps({
  percent: {
    type: [Number, String],
    default: 0
  },
  size: {
    type: [Number, String],
    default: 70
  },
  innerBgColorOnComplete: {
    type: String,
    default: '#fff'
  },
  innerBgColorInProgress: {
    type: String,
    default: '#fff'
  },
  completeIcon: {
    type: Object,
    default: () => ({
      strokeColor: '#358DE8',
      strokeWidth: '5',
      width: '32',
      height: '32'
    })
  },
  showText: {
    type: Boolean,
    default: true
  }
});

const {
  percent,
  size,
  innerBgColorOnComplete,
  innerBgColorInProgress,
  completeIcon,
  showText
} = toRefs(defineProps);
</script>

<template>
  <div
    class="radial-progress"
    :style="{
      background: `conic-gradient(#358DE8 ${percent}% 5%, #EAECF0 ${percent}%)`,
      width: size + 'px',
      height: size + 'px'
    }"
  >
    <div
      v-if="Number.parseInt(percent) >= 100"
      class="radial-progress__part"
      :style="{
        'background-color': innerBgColorOnComplete
      }"
    >
      <CompletedIcon :icon-options="completeIcon" />
    </div>
    <div
      v-else
      class="radial-progress__part"
      :style="{
        'background-color': innerBgColorInProgress
      }"
    >
      <template v-if="showText">
        <div class="radial-progress__percent">
          {{ Math.round(Number.parseInt(percent)) }}%
        </div>
        <div class="radial-progress__label">
          viewed
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss">
.radial-progress {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #0B243D;
  border-radius: 50%;

  &__part {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    height: 80%;
    width: 80%;
    background-color: #fff;
    border-radius: 50%;
    box-shadow: 0px 0px 7px 0px rgba(0, 0, 0, 0.1);
  }

  &__percent {
    font-weight: 700;
    font-size: inherit;
    color: inherit;
  }

  &__label {
    font-size: 10px;
    color: inherit;
    font-weight: 500;
  }
}
</style>
