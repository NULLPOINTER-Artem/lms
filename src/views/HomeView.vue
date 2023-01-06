<script setup>
import { shallowRef } from 'vue';

// Components
import SearchIcon from '../components/icons/SearchIcon.vue';
import CalendarIcon from '../components/icons/CalendarIcon.vue';
import CardFileIcon from '../components/icons/CardFileIcon.vue';
import ShieldIcon from '../components/icons/ShieldIcon.vue';
import PlayIcon from '../components/icons/PlayIcon.vue';

const categories = shallowRef([
  {
    id: 1,
    name: 'Reservations',
    icon: CalendarIcon,
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut eget porttitor urna. In gravida, orci vel pretium lobortis.'
  },
  {
    id: 2,
    name: 'How-Tos',
    icon: CardFileIcon,
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut eget porttitor urna. In gravida, orci vel pretium lobortis.'
  },
  {
    id: 3,
    name: 'Policies',
    icon: ShieldIcon,
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut eget porttitor urna. In gravida, orci vel pretium lobortis.'
  },
  {
    id: 4,
    name: 'Video Library',
    icon: PlayIcon,
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut eget porttitor urna. In gravida, orci vel pretium lobortis.'
  }
]);

const popularLessons = shallowRef([
  {
    id: 1,
    name: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  {
    id: 2,
    name: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  {
    id: 3,
    name: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  {
    id: 4,
    name: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  {
    id: 5,
    name: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  {
    id: 6,
    name: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  {
    id: 7,
    name: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  {
    id: 8,
    name: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  }
]);
</script>

<template>
  <div class="home-view">
    <header class="home-view__heading">
      <div class="home-view__heading-label">
        <h1>Tourbase Knowledgebase</h1>
      </div>
      <div class="home-view__heading-search">
        <SearchIcon />
        <input type="search" name="knowledgebase-search" placeholder="Go ahead, ask away" />
      </div>
    </header>
    <div class="home-view__container">
      <div class="home-view__categories-list">
        <div
          class="home-view__categories-item"
          v-for="category of categories"
          :key="category.id"
        >
          <div class="home-view__categories-item__heading">
            {{ category.name }}
          </div>
          <div class="home-view__categories-item__icon">
            <component :is="category.icon" />
          </div>
          <p class="home-view__categories-item__info">
            {{ category.description }}
          </p>
        </div>
      </div>
      <div class="home-view__popular">
        <div class="home-view__popular__heading">
          Popular Lessons
        </div>
        <div class="home-view__popular__container">
          <ul class="home-view__popular-list">
            <li
              class="home-view__popular-item"
              v-for="lesson of popularLessons"
              :key="lesson.id"
            >
              <span>{{ lesson.name }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.home-view {
  padding-bottom: 50px;

  &__heading {
    width: 100%;
    background-color: #101828;
    margin-bottom: 50px;
    padding: 100px;

    &-label {
      margin: 0 auto 25px;
      color: #fff;
      font-weight: 700;
      font-size: 36px;
      text-align: center;
    }

    &-search {
      margin: 0 auto;
      max-width: 500px;
      min-width: 320px;
      max-height: 55px;
      min-height: 20px;
      background-color: #fff;
      border: 1px solid #D0D5DD;
      border-radius: 10px;
      padding: 15px 25px;

      svg {
        margin-right: 15px;
      }

      input[type="search"] {
        width: 90%;

        &::placeholder {
          font-weight: 500;
          color: #98A2B3;
          font-size: 14px;
        }

        &::-webkit-search-cancel-button {
          cursor: pointer;
        }
      }
    }
  }

  &__container {
    width: 100%;
    padding: 0 55px;
    margin: 0 auto;
    max-width: 1168px;
  }

  &__categories-list {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
    width: 100%;
    margin: 0 auto 40px;
  }

  &__categories-item {
    width: 20%;
    min-width: 251px;
    padding: 40px 25px;
    background-color: #fff;
    border-radius: 10px;
    margin-right: 18px;
    margin-bottom: 18px;

    &:last-child {
      margin-right: 0;
    }

    &__heading {
      font-weight: 700;
      font-size: 24px;
      text-align: center;
      color: #0B243D;
      margin-bottom: 20px;
    }

    &__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;

      svg {
        width: 55px;
        height: 55px;
      }
    }

    &__info {
      text-align: center;
      color: #475467;
      font-weight: 400;
      font-size: 12px;
      line-height: 21px;
      margin-bottom: 10px;
    }
  }

  &__popular {
    background-color: #fff;
    padding: 45px 10px;
    margin: 0 auto;
    width: 100%;
    border-radius: 10px;

    &-list {
      width: 70%;
      padding-left: unset;
      margin: 0 auto;
    }

    &-item {
      position: relative;
      color: #0B243D;
      font-weight: 400;
      font-size: 12px;
      line-height: 18px;
      margin-bottom: 15px;
      width: 50%;
      display: inline-block;

      &:nth-child(even) {
        text-align: right;
      }

      span {
        position: relative;
        padding-left: 20px;
        top: -4px;
      }

      &::before {
        content: '';
        position: absolute;
        border-radius: 50%;
        width: 10px;
        height: 10px;
        background-color: #358DE8;
      }
    }

    &__heading {
      color: #0B243D;
      font-weight: 700;
      font-size: 24px;
      text-align: center;
      margin-bottom: 30px;
    }

    &__container {
      width: 100%;
    }
  }
}
</style>
