<template>
  <div>
    <nav
      id="quick-controls"
      :aria-label="quickControlsNavLabel"
    >
      <ul class="control-list no-separators">
        <li class="control-item control-action zoom-controls">
          <span>{{ zoomLabel }}</span>
          <button
            class="button control-action"
            :aria-label="zoomInLabel"
            @click="emit('zoom-in')"
          >
            +
          </button>
          <button
            class="button control-action"
            :aria-label="zoomOutLabel"
            @click="emit('zoom-out')"
          >
            -
          </button>
        </li>
        <li class="control-item">
          <span>{{ downloadLabel }}</span>
          <a
            class="button control-action download-button icon-only"
            :href="downloadSite"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="downloadAriaLabel"
            :title="currentLanguageDownloadText"
          >
            <FontAwesomeIcon
              :icon="['fas', 'download']"
              class="control-icon"
              aria-hidden="true"
            />
          </a>
        </li>
        <li class="control-item">
          <span>{{ languageLabel }}</span>
          <label
            for="language-select"
            class="only"
          >
            {{ languageSelectLabel }}
          </label>
          <select
            id="language-select"
            v-model="languageValue"
            class="button"
            :aria-label="languageSelectLabel"
          >
            <option value="en">
              English
            </option>
            <option value="es">
              Espanol
            </option>
          </select>
        </li>
        <li class="control-item">
          <span>{{ moreInfoLabel }}</span>
        </li>
        <li class="control-item">
          <ExpandingSidebar>
            <template #sidebarTitle>
              {{ contributorsLabel }}
            </template>
            <template #sidebarMessage>
              <AuthorshipSection class="hidden" />
            </template>
          </ExpandingSidebar>
        </li>
        <li class="control-item">
          <button
            class="button control-action"
            :aria-controls="descriptionPanelId"
            :aria-expanded="isDescriptionOpen ? 'true' : 'false'"
            @click="emit('toggle-description')"
          >
            {{ descriptionSummaryLabel }}
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ExpandingSidebar from './ExpandingSidebar.vue'
import AuthorshipSection from './AuthorshipSection.vue'

const props = defineProps({
  inEnglish: {
    type: Boolean,
    required: true
  },
  selectedLanguage: {
    type: String,
    required: true
  },
  downloadSite: {
    type: String,
    required: false,
    default: null
  },
  downloadAriaLabel: {
    type: String,
    required: true
  },
  currentLanguageDownloadText: {
    type: String,
    required: false,
    default: ''
  },
  descriptionPanelId: {
    type: String,
    required: true
  },
  isDescriptionOpen: {
    type: Boolean,
    required: true
  },
  descriptionSummaryLabel: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['zoom-in', 'zoom-out', 'set-language', 'toggle-description'])

const languageValue = computed({
  get: () => props.selectedLanguage,
  set: (value) => {
    emit('set-language', value)
  }
})

const quickControlsNavLabel = computed(() => (props.inEnglish ? 'Primary diagram controls' : 'Controles principales del diagrama'))
const zoomLabel = computed(() => (props.inEnglish ? 'Zoom:' : 'Acercar:'))
const downloadLabel = computed(() => (props.inEnglish ? 'Download:' : 'Descargar:'))
const languageLabel = computed(() => (props.inEnglish ? 'Language:' : 'Idioma:'))
const languageSelectLabel = computed(() => (props.inEnglish ? 'Change language' : 'Cambiar idioma'))
const moreInfoLabel = computed(() => (props.inEnglish ? 'More info:' : 'Mas informacion:'))
const contributorsLabel = computed(() => (props.inEnglish ? 'Contributors' : 'Colaboradores'))
const zoomInLabel = computed(() => (props.inEnglish ? 'Zoom in' : 'Acercar'))
const zoomOutLabel = computed(() => (props.inEnglish ? 'Zoom out' : 'Alejar'))
</script>

<style scoped lang="scss">
#quick-controls {
  padding: 0 1.5rem;
  margin-top: 0.5rem;
}

.download-button {
  min-width: 2.4rem;
}

.download-button.icon-only {
  min-height: 3rem;
  padding-left: 0.7rem;
  padding-right: 0.7rem;
}
</style>
