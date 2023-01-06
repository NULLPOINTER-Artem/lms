<script setup>
import { defineProps, defineEmits } from 'vue';

// Helpers
import getParentElementWithClass from '../helpers/getParentElementWithClass.js';
import OptionsMenu from './OptionsMenu.vue';

const emit = defineEmits(['delete-item', 'edit-item']);
const props = defineProps({
  tableData: {
    type: Object,
    required: true
  }
});

function onOpenOptions({ event, menuOptions, popperItem, generateGetBoundingClientRect }) {
  if (menuOptions.style.display !== 'block') {
    const btn_options = getParentElementWithClass(event.target, 'options-menu__btn');

    const rect = btn_options.getBoundingClientRect();
    popperItem.virtualTarget.getBoundingClientRect = generateGetBoundingClientRect(rect.x, rect.y);

    popperItem.instance.update();
    menuOptions.style.display = 'block';
  } else {
    menuOptions.style.display = 'none';
  }
}

function onDelete(options) {
  emit('delete-item', options);
}

function onEdit(options) {
  emit('edit-item', options);
}
</script>

<template>
  <div class="table-container">
    <div
      class="table-container__header"
      :style="{ 'grid-template-columns': `repeat(${props.tableData.header_items.length}, 1fr)` }"
    >
      <div
        class="table-container__header-col"
        v-for="(headerItem, index) of props.tableData.header_items"
        :key="headerItem + index"
      >
        {{ headerItem }}
      </div>
    </div>
    <div class="table-container__rows">
      <div
        class="table-container__rows-item"
        :style="{ 'grid-template-columns': `repeat(${props.tableData.header_items.length}, 1fr)` }"
        v-for="item of props.tableData.items"
        :key="item.id"
      >
        <div
          class="table-container__rows-col"
          v-for="headerItem of props.tableData.header_items"
          :key="headerItem + item.id"
        >
          <OptionsMenu
            v-if="headerItem === 'action'"
            :item="item"
            @edit="onEdit"
            @delete="onDelete"
            @open-menu="onOpenOptions"
          />
          <span v-else>
            {{ item[headerItem] }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.table-container {
  margin: 0 auto;
  width: 90%;
  background-color: #fff;
  border-radius: 10px;

  &__header {
    display: grid;
    padding: 20px 30px;
    border-bottom: 1px solid #EAECF0;

    &-col {
      max-width: 400px;
      color: #A6B2C1;
      font-weight: 500;
      font-size: 14px;
      text-transform: capitalize;

      &:last-child {
        text-align: right;
      }
    }
  }

  &__rows {
    &-item {
      display: grid;
      border-bottom: 1px solid #EAECF0;
      padding: 20px 30px;
    }

    &-col {
      max-width: 400px;
      font-weight: 500;
      font-size: 14px;
      color: #0B243D;
      text-transform: capitalize;

      &:last-child {
        text-align: right;
      }

      svg {
        cursor: pointer;
      }
    }
  }
}
</style>
