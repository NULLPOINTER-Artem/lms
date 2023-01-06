<script setup>
import { createApp, nextTick, onBeforeUnmount, onMounted, reactive, ref, shallowRef } from 'vue';
import urql from '@urql/vue';
import { useClientHandle } from '@urql/vue';
import { storeToRefs } from 'pinia';
import Editor from '@tinymce/tinymce-vue';

// Hooks
import usePopper from '../hooks/usePopper.js';
import usePagesSidebar from '../hooks/usePagesSidebar.js';
import useDebounce from '../hooks/useDebounce.js';

// Store
import { roles, useUser } from '../stores/user.js';
import { useAPIStore } from '../stores/APIStore';

// Helpers
import createElementHTML from '../helpers/createElementHTML.js';
import generateId from '../helpers/generateId.js';
import { variantsToString } from '../helpers/variantsTools.js';
import getParentElementWithClass from '../helpers/getParentElementWithClass';

// API
import {
  mutationCreateQuizBody,
  mutationCreateQuestionBody,
  mutationUpdatePageQuizzesBody,
} from '../API/mutationBodies';
import { setElementValueInputEntry } from '../API/tools/common.js';

// Components
import EditorBar from '../components/EditorBar.vue';
import QuizContainer from '../components/QuizContainer.vue';
import PagesSidebar from '../components/PagesSidebar.vue';
import BtnAdd from '../components/BtnAdd.vue';
import TrashIcon from '../components/icons/TrashIcon.vue';
import LoadBannerIcon from '../components/icons/LoadBannerIcon.vue';

// Constants
const editorElements = {
  'p': {
    classes: 'content__item paragraph-edit-block'
  },
  'h3': {
    classes: 'content__item heading_1'
  },
  'h4': {
    classes: 'content__item heading_2'
  },
  'blockquote': {
    classes: 'content__item blockquote_1'
  },
};
const API_KEY = 'hbpntpdtw94y49ja0760xeyt3yib2phh19kk9qujcucdn6k5';

// Global
const handleClient = useClientHandle();

// Hooks
const {
  changeContent,
  passContent,
  insertQuizzesIntoContent,
  addQuizInstance
} = usePagesSidebar();
const { getPopper, addPopper, generateGetBoundingClientRect } = usePopper();
const debouncedInsertQuizzes = useDebounce(insertQuizzesIntoContent, 50);

// State
const APIStore = useAPIStore();
const contentEditor = ref({
  id: null,
  title: '',
  content: '',
  currentPageId: null,
  banner_data: null,
  quizzes: []
});
const refBtnAdd = ref(null);
const imageLoader = ref(null);
const bannerLoader = ref(null);
const hasPages = ref(false);
const current_lesson_data = reactive({
  entry_id: '',
  categories: [],
  name: 'New Lesson'
});
const editorInstance = ref(null);
const contentFormats = shallowRef([
  {
    id: 1,
    text_label: 'Text',
    handler: formatText
  },
  {
    id: 2,
    text_label: 'Header 1',
    handler: formatHeader1
  },
  {
    id: 3,
    text_label: 'Header 2',
    handler: formatHeader2
  },
  {
    id: 4,
    text_label: 'Quote 1',
    handler: formatQuote1
  },
  {
    id: 5,
    text_label: 'Quote 2',
    handler: formatQuote2
  },
  {
    id: 6,
    text_label: 'Bulleted List',
    handler: formatBulletedList
  },
  {
    id: 7,
    text_label: 'Ordered List',
    handler: formatOrderedList
  },
  {
    id: 8,
    text_label: 'Image',
    handler: formatImage
  },
  {
    id: 9,
    text_label: 'Video',
    handler: formatVideo
  },
  {
    id: 10,
    text_label: 'Quiz',
    handler: formatQuiz
  }
]);

// Store Refs
const { role } = storeToRefs(useUser());

// Mutations
const mutationUpdatePageQuizzes = handleClient.useMutation(mutationUpdatePageQuizzesBody);
const mutationCreateQuiz = handleClient.useMutation(mutationCreateQuizBody);
const mutationCreateQuestion = handleClient.useMutation(mutationCreateQuestionBody);

onMounted(() => {
  bannerLoader.value.addEventListener('change', onChangeBannerLoader);

  addPopper('btnAdd', {
    virtualTarget: {
      getBoundingClientRect: generateGetBoundingClientRect()
    },
    popperEl: refBtnAdd.value,
    options: {
      placement: 'left',
      strategy: 'fixed',
      modifiers: [
        {
          name: 'computeStyles',
          options: {
            gpuAcceleration: false
          },
        },
        {
          name: 'eventListeners',
          options: {
            scroll: false,
          }
        },
        {
          name: 'offset',
          options: {
            offset: [17, 10],
          },
        }
      ],
    }
  });
});

onBeforeUnmount(() => {
  editorInstance.value = null;
})

function checkingAddBtn() {
  refBtnAdd.value.hasAttribute('data-opened') && refBtnAdd.value.click();
}

function nodeChangeCallback(element) {
  const tagName = element.tagName.toLowerCase();
  let parentParagraph = null;

  // Checking to hide menu of the btn add
  checkingAddBtn();

  // Set class selectors to element of edit content and avoid incorrect selectors
  const currentElement = editorElements[tagName];
  if (currentElement) element.className = currentElement.classes;

  if (element.textContent.length > 0) {
    const checkParent = getParentElementWithClass(element, 'paragraph-edit-empty');
    if (checkParent) checkParent.classList.remove('paragraph-edit-empty');
  }

  if (tagName === 'p') {
    // Is length of a line > 0, in a page content then hide the add btn and placeholder
    if (element.textContent.length > 0) {
      element.classList.remove('paragraph-edit-empty');

      refBtnAdd.value.style.display = 'none';
      return;
    }

    // Otherwise show the add btn and update position of the btn also show the placeholder
    if (element.textContent.length === 0) {
      element.classList.add('paragraph-edit-empty');
      element.setAttribute('data-placeholder', 'Type something...');
    }

    const btnAddPopper = getPopper('btnAdd');

    const rect = element.getBoundingClientRect();
    btnAddPopper.virtualTarget.getBoundingClientRect = generateGetBoundingClientRect(rect.x, rect.y);

    btnAddPopper.instance.update().then(() => {
      if (refBtnAdd.value.style.inset) {
        const [top, right] = refBtnAdd.value.style.inset.split(' ');
        refBtnAdd.value.style.cssText = `display: block; top: ${top} !important; right: ${right} !important;`;
      }
    });
  } else {
    parentParagraph = getParentElementWithClass(element, 'paragraph-edit-block');

    if (parentParagraph) {
      nodeChangeCallback(parentParagraph);
      return;
    }

    // Hide the add btn
    refBtnAdd.value.style.display = 'none';
  }
}

function createMediaElement(editor, source) {
  const iframe = createElementHTML('iframe', {
    attributes: {
      allowfullscreen: '',
      loading: 'lazy'
    },
    src: source,
    className: 'content__item content__iframe'
  });

  const figureBlock = createElementHTML('figure', {
    className: 'content__item content__figure',
    ElementChildren: {
      div: {
        className: 'media-block__wrapper',
        attributes: {
          draggable: true
        },
        ElementChildren: {
          iframe: iframe
        }
      },
      figcaption: {
        className: 'caption-wrapper',
        ElementChildren: {
          p: {
            className: 'content__item paragraph-edit-empty',
            attributes: {
              'data-placeholder': 'Add a caption (optional)',
            },
            ElementChildren: {
              span: {
                innerHTML: '<br/>',
              }
            }
          }
        }
      }
    }
  });

  replaceElementWith(figureBlock, editor);
}

function createImageElement(editor, data) {
  let imgInstance = new Image();

  imgInstance.onload = function() {
    const img = createElementHTML('img', {
      className: 'content__item content__image',
      src: data,
      attributes: {
        width: this.width > 800 ? '800px' : this.width + 'px',
        height: this.width > 800 ? (this.height / 2) + 'px' : this.height + 'px'
      }
    });

    const figureBlock = createElementHTML('figure', {
      className: 'content__item content__figure',
      ElementChildren: {
        div: {
          className: 'media-block__wrapper',
          attributes: {
            draggable: true
          },
          ElementChildren: {
            img: img
          }
        },
        figcaption: {
          className: 'caption-wrapper',
          ElementChildren: {
            p: {
              className: 'content__item paragraph-edit-empty',
              attributes: {
                'data-placeholder': 'Add a caption (optional)',
              },
              ElementChildren: {
                span: {
                  innerHTML: '<br/>',
                }
              }
            }
          }
        }
      }
    });

    replaceElementWith(figureBlock, editor);
    imageLoader.value.value = '';
    imgInstance = null;
  }

  imgInstance.src = data;
}

function replaceElementWith(targetElement, editor) {
  const paragraph = createElementHTML('p', {
    attributes: {
      'data-placeholder': 'Type something...'
    },
    innerHTML: '<br/>',
    className: 'content__item paragraph-edit-block paragraph-edit-empty'
  });

  const element = getParentElementWithClass(editor.selection.getRng().startContainer, 'content__item');
  const editorEl = element.parentNode;

  editorEl.replaceChild(targetElement, element);

  const childParagraph = editorEl.appendChild(paragraph);
  setFocusOnElement(childParagraph, editor);

  refBtnAdd.value.click();
}

function setFocusOnElement(element, editor) {
  const range = document.createRange();
  range.setStart(element, 0);

  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);

  editor.nodeChanged();
}

/**
 * This function set correct position of the context menu
 * @param {TinyMCEInstance} editor
 */
function handleRetrieveSelection(editor) {
  const selection = document.getSelection();

  if (!selection || !selection.toString()) return;

  setTimeout(() => {
    const popper = document.querySelector('.tox-pop--bottom');

    if(popper) {
      if (!editor.selection.isCollapsed()) {
        popper.style.display = 'block';

        const bottomVal = Number.parseInt(popper.style.bottom);

        if (bottomVal >= window.innerHeight) {
          const OFFSET = 60;
          const rect = editor.selection.getRng().startContainer.parentElement.getBoundingClientRect();
          popper.style.bottom = ((bottomVal - rect.top) + OFFSET) + 'px';
        }
      } else {
        popper.style.display = 'none';
      }
    }
  }, 100);
}

function resetContentEditor() {
  contentEditor.value = {
    id: null,
    title: '',
    content: '',
    currentPageId: null
  };
}

function formatText() {
  editorInstance.value.execCommand('FormatBlock', false, 'text');
}

function formatHeader1() {
  editorInstance.value.execCommand('FormatBlock', false, 'header_1');
}

function formatHeader2() {
  editorInstance.value.execCommand('FormatBlock', false, 'header_2');
}

function formatQuote1() {
  editorElements.blockquote.classes = 'content__item blockquote_1';
  editorInstance.value.execCommand('FormatBlock', false, 'blockquote_1');
}

function formatQuote2() {
  editorElements.blockquote.classes = 'content__item blockquote_2';
  editorInstance.value.execCommand('FormatBlock', false, 'blockquote_2');
}

function formatBulletedList() {
  editorInstance.value.execCommand('InsertUnorderedList', false, {
    'list-style-type': 'disc',
    'list-item-attributes': { class: 'bull-list__item' },
    'list-attributes': { class: 'content__item bull-list' }
  });
}

function formatOrderedList() {
  editorInstance.value.execCommand('InsertOrderedList', false, {
    'list-style-type': 'decimal',
    'list-item-attributes': { class: 'order-list__item' },
    'list-attributes': { class: 'content__item order-list' }
  });
}

function formatImage() {
  imageLoader.value.click();
}

function formatVideo() {
  const selectedText = window.getSelection().toString();

  if (!selectedText) {
    const currentNode = editorInstance.value.selection.getNode();
    currentNode.classList.replace('paragraph-edit-block', 'paragraph-edit-prop');
    currentNode.setAttribute('data-placeholder', 'Insert link here');

    const allBrs = [...currentNode.querySelectorAll('br')];

    allBrs.forEach((br) => currentNode.removeChild(br));

    const spanEl = createElementHTML('span', {
      innerHTML: '<br/>'
    });

    currentNode.append(spanEl);

    refBtnAdd.value.click();
  } else {
    createMediaElement(editorInstance.value, selectedText);
  }
}

/**
 * This function create new Quiz and add it to the page then insert the quiz into the page content
 */
async function formatQuiz() {
  const newId = generateId(Math.floor(Math.random() * 7) + 1);
  const default_answer_variants = [
    "This is first option",
    "This is second option",
    "This is third option"
  ];
  const default_correct_variants = [
    ""
  ]

  const currentQuestion = await mutationCreateQuestion.executeMutation({
    project_id: localStorage.getItem('project_id'),
    question_api_name: `question_api_name_${newId}`,
    question_text: '',
    variants_of_answers: variantsToString(default_answer_variants),
    correct_answers: variantsToString(default_correct_variants),
  });

  const currentQuiz = await mutationCreateQuiz.executeMutation({
    project_id: localStorage.getItem('project_id'),
    quiz_api_name: `quiz_api_name__${newId}`,
    quiz_name: `quiz_name__${newId}`,
    quiz_questions: setElementValueInputEntry(
      {
        id__in: [currentQuestion.data.entries_create[0].id]
      }
    )
  });

  // Add quiz to the page
  contentEditor.value.quizzes.push(currentQuiz.data.entries_create[0]);

  // Async update quizzes of the page
  mutationUpdatePageQuizzes.executeMutation({
    project_id: localStorage.getItem('project_id'),
    page_id: contentEditor.value.currentPageId,
    page_quizzes: setElementValueInputEntry(
      {
        id__in: contentEditor.value.quizzes.map((quiz) => quiz.id)
      }
    )
  });

  const figureEl = createElementHTML('figure', {
    attributes: {
      'data-quiz_id': currentQuiz.data.entries_create[0].id,
      contenteditable: false,
      tabindex: "-1"
    },
    className: 'content__item content__figure'
  });

  const selectedElement = editorInstance.value.selection.getRng().endContainer;
  selectedElement.parentNode.insertBefore(figureEl, selectedElement);

  const instance = createApp(QuizContainer, {
    quizId: currentQuiz.data.entries_create[0].id,
    role,
    roles,
    urlAPI: `${APIStore.getDomainAPI()}${APIStore.getEndPointGraphQL()}`
  })
    .use(urql, APIStore.getClient());

  addQuizInstance(currentQuiz.data.entries_create[0].id, instance);
  instance.mount(figureEl);
  setFocusOnElement(selectedElement, editorInstance.value);
}

function setupEditor(editor) {
  editorInstance.value = editor;

  imageLoader.value.addEventListener('change', function () {
    const fr = new FileReader();
    const file = imageLoader.value.files[0];

    fr.onload = () => createImageElement(editor, fr.result);
    fr.readAsDataURL(file);
  });

  editor.ui.registry.addMenuButton('content', {
    text: 'Content',
    fetch: function (callback) {
      const items = [
        {
          type: 'menuitem',
          text: 'Text',
          onAction: formatText
        },
        {
          type: 'menuitem',
          text: 'Header 1',
          onAction: formatHeader1
        },
        {
          type: 'menuitem',
          text: 'Header 2',
          onAction: formatHeader2
        },
        {
          type: 'menuitem',
          text: 'Quote 1',
          onAction: formatQuote1
        },
        {
          type: 'menuitem',
          text: 'Quote 2',
          onAction: formatQuote2
        },
        {
          type: 'menuitem',
          text: 'Bulleted List',
          onAction: formatBulletedList
        },
        {
          type: 'menuitem',
          text: 'Ordered List',
          onAction: formatOrderedList
        },
        {
          type: 'menuitem',
          text: 'Image',
          onAction: formatImage
        },
        {
          type: 'menuitem',
          text: 'Video',
          onAction: formatVideo
        },
        {
          type: 'menuitem',
          text: 'Quiz',
          onAction: formatQuiz
        }
      ];
      callback(items);
    }
  });

  editor.ui.registry.addContextToolbar('textselection', {
    predicate: function (element) {
      const tagName = element.tagName.toLowerCase();

      if (tagName === 'img' || tagName === 'figure') return false;

      return !editor.selection.isCollapsed();
    },
    items: 'content | fontsizeselect | bold italic underline strikethrough link |' + ' ' +
      'forecolor backcolor removeformat | alignleft aligncenter alignright',
    position: 'selection',
    scope: 'node'
  });

  editor.on('focus', function () {
    checkingAddBtn();
  });

  editor.on('paste', function (e) {
    e.preventDefault();

    const clipboardData = e.clipboardData || window.clipboardData;
    const data = clipboardData.getData('Text');
    let targetElement = getParentElementWithClass(e.target, 'paragraph-edit-prop');

    if (targetElement && targetElement.classList.contains('paragraph-edit-prop')) {
      createMediaElement(editor, data);
    } else {
      if (e.target.tagName === 'BR') {
        e.target.parentElement.innerHTML = data;
      } else {
        e.target.innerHTML = data;
      }
    }
  });

  editor.on('MouseUp', function () {
    handleRetrieveSelection(editor);
  });

  editor.on('KeyUp', function () {
    handleRetrieveSelection(editor);
  });

  editor.on('BeforeSetContent', function (e) {
    if (contentEditor.value.content) {
      e.content = contentEditor.value.content;
    } else {
      e.content = '<p data-placeholder="Type something..."' + ' ' +
        'class="content__item paragraph-edit-block paragraph-edit-empty"></p>';
    }
  });

  editor.on('SetContent', function () {
    debouncedInsertQuizzes(contentEditor.value, '.editor-content');
  });

  editor.on('NodeChange', function (e) {
    const element = e.element;

    nodeChangeCallback(element);
  })
}

function openContent() {
  const TOP_OFFSET = 10;
  const LEFT_OFFSET = 107;
  const MAX_HEIGHT = 250;
  const MIN_WIDTH = 84;
  const menu_content = document.querySelector('.editor-menu-content');
  const menu_contentPopper = getPopper('menu_content');

  if (!menu_contentPopper) {
    addPopper('menu_content', {
      virtualTarget: {
        getBoundingClientRect: generateGetBoundingClientRect()
      },
      popperEl: menu_content,
      options: {
        placement: 'top',
        modifiers: [
          {
            name: 'computeStyles',
            options: {
              gpuAcceleration: false
            },
          },
          {
            name: 'eventListeners',
            options: {
              scroll: false,
            }
          },
        ],
      }
    });

    openContent();
    return;
  }

  const rect = refBtnAdd.value.getBoundingClientRect();
  const editorRect = document.querySelector('.editor').getBoundingClientRect();
  menu_contentPopper.virtualTarget.getBoundingClientRect = generateGetBoundingClientRect(rect.x, rect.y);

  menu_contentPopper.instance.update().then(() => {
    const top = Math.abs((editorRect.top - rect.top) + MAX_HEIGHT + TOP_OFFSET);
    const right = Number.parseInt(refBtnAdd.value.style.right) - LEFT_OFFSET;
    menu_content.style.cssText = `
      display: block;
      position: absolute;
      top: ${top}px !important;
      right: ${right}px !important;
      overflow: hidden auto;
      max-height: ${MAX_HEIGHT}px;
      min-width: ${MIN_WIDTH}px;
    `;
  });
}

function closeContent() {
  nextTick(() => {
    const menu_content = document.querySelector('.editor-menu-content');
    menu_content.style.display = 'none';
  })
}

function onLoadBanner() {
  bannerLoader.value.click();
}

function onChangeContent(data) {
  if (!hasPages.value) hasPages.value = true;

  if (refBtnAdd.value) refBtnAdd.value.style.display = 'none';

  changeContent(data, contentEditor.value);
}

function onNoPages() {
  resetContentEditor();
  hasPages.value = false;
}

function handleChangeOfTitle(e) {
  contentEditor.value.title = e.target.textContent;
}

function onChangeBannerLoader() {
  const fr = new FileReader();
  const file = bannerLoader.value.files[0];

  fr.onload = () => {
    const img = document.querySelector('.editor-header__cover-container');
    img.style.backgroundImage = `url(${fr.result})`;

    contentEditor.value.banner_data = fr.result;

    bannerLoader.value.value = '';
  }

  fr.readAsDataURL(file);
}

function onDeleteBanner() {
  contentEditor.value.banner_data = "";
}

function setLessonName(name) {
  current_lesson_data.name = name;
}

function setLessonCategories(categories) {
  current_lesson_data.categories = categories;
}

function setLessonEntryId(lesson_id) {
  current_lesson_data.entry_id = lesson_id;
}

function onInputLessonName(updLessonName) {
  current_lesson_data.name = updLessonName;
}
</script>

<template>
  <EditorBar
    :lesson-name="current_lesson_data.name"
    :lesson-categories="current_lesson_data.categories"
    :lesson-entry-id="current_lesson_data.entry_id"
    :set-lesson-categories="setLessonCategories"
    @input-lesson-name="onInputLessonName"
  />
  <div class="editor">
    <PagesSidebar
      :curr-title="contentEditor.title"
      :pass-save-content="() => passContent(contentEditor)"
      :set-lesson-name="setLessonName"
      :set-lesson-categories="setLessonCategories"
      :set-lesson-entry-id="setLessonEntryId"
      :lesson-name="current_lesson_data.name"
      @add-new-page="onChangeContent"
      @change-page="onChangeContent"
      @no-pages="onNoPages"
    />
    <div class="editor-wrapper">
      <div v-if="hasPages">
        <div :class="['editor-header', {'editor-header-banner-loaded': contentEditor.banner_data}]">
          <div v-show="contentEditor.banner_data" class="editor-header__cover-container">
            <div class="cover-container__overlay" />
          </div>
          <div class="editor-header__btn-container">
            <button class="btn-container__add" @click="onLoadBanner">
              <LoadBannerIcon
                :icon-options="{
                  color: contentEditor.banner_data ? 'white' : 'black'
                }"
              />
              {{ !contentEditor.banner_data ? 'Add' : 'Change' }} Banner
            </button>
            <button v-show="contentEditor.banner_data" class="btn-container__delete" @click="onDeleteBanner">
              <TrashIcon
                :icon-options="{
                  strokeColor: contentEditor.banner_data ? 'white' : 'black',
                  strokeWidth: '1.375',
                  width: '22',
                  height: '22',
                  viewBox: '0 0 22 22'
                }"
              />
            </button>
          </div>
          <div class="editor-header__title-container">
            <h1
              class="editor-header__title header-placeholder"
              data-placeholder="New Page"
              contenteditable="true"
              @input="handleChangeOfTitle($event)"
            >
              {{ contentEditor.title }}
            </h1>
          </div>
        </div>
        <Editor
          tag-name="div"
          id="editor-page"
          class="editor-content"
          cloud-channel="6"
          output-format="html"
          v-model="contentEditor.content"
          plugins="lists link"
          :api-key="API_KEY"
          :inline="true"
          :init="{
            menubar: false,
            statusbar: false,
            toolbar: false,
            contextmenu: false,
            formats: {
              strikethrough: { inline: 'del' },
              bold: { inline: 'strong' },
              text: { block: 'p', classes: 'content__item paragraph-edit-block' },
              header_1: { block: 'h3', classes: 'content__item heading_1' },
              header_2: { block: 'h4', classes: 'content__item heading_2' },
              blockquote_1: { block: 'blockquote', classes: 'content__item blockquote_1' },
              blockquote_2: { block: 'blockquote', classes: 'content__item blockquote_2' },
            },
            setup: setupEditor
          }"
        />
      </div>
      <div v-else class="no-pages">
        The lesson has not pages yet
      </div>
      <BtnAdd
        :get-ref="(el) => { refBtnAdd = el }"
        @open="openContent()"
        @close="closeContent()"
      />
      <input ref="imageLoader" type="file" style="display: none;" />
      <input ref="bannerLoader" type="file" style="display: none;" />
    </div>
    <div class="editor-menu-content">
      <div class="editor-menu-content__container">
        <div
          class="editor-menu-content__item"
          v-for="contentFormat of contentFormats"
          :key="contentFormat.id"
          @click="contentFormat.handler"
        >
          <div class="editor-menu-content__item-label">
            {{ contentFormat.text_label }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import '../assets/css/editor.scss';
</style>
