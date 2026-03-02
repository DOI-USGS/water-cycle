<template>
  <section
    id="quick-controls"
    :aria-labelledby="quickControlsHeadingId"
  >
    <h2
      :id="quickControlsHeadingId"
      class="only"
    >
      {{ quickControlsSectionLabel }}
    </h2>
    <ul
      class="control-list no-separators"
      role="toolbar"
      :aria-label="quickControlsToolbarLabel"
      aria-orientation="horizontal"
    >
      <li class="control-item">
        <span class="control-prefix">{{ zoomLabel }}</span>
        <button
          class="button control-action control-small"
          :aria-label="zoomInLabel"
          @click="emit('zoom-in')"
        >
          +
        </button>
        <button
          class="button control-action control-small"
          :aria-label="zoomOutLabel"
          @click="emit('zoom-out')"
        >
          -
        </button>
      </li>
      <li class="control-item">
        <span class="control-prefix">{{ downloadLabel }}</span>
        <a
          class="button control-action download-button"
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
        <span class="control-prefix">{{ languageLabel }}</span>
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
          <option
            value="en"
            lang="en"
          >
            English
          </option>
          <option
            value="es"
            lang="es"
          >
            Espanol
          </option>
        </select>
      </li>
      <li class="control-item">
        <span class="control-prefix">{{ moreInfoLabel }}</span>
      </li>
      <li class="control-item">
        <button
          id="description-toggle"
          class="button control-action"
          :aria-controls="descriptionPanelId"
          :aria-expanded="isDescriptionOpen ? 'true' : 'false'"
          @click="emit('toggle-description')"
        >
          {{ descriptionSummaryLabel }}
        </button>
      </li>
      <li class="control-item">
        <button
          class="button control-action"
          :aria-controls="contributorsPanelId"
          :aria-expanded="isContributorsOpen ? 'true' : 'false'"
          @click="emit('toggle-contributors')"
        >
          {{ contributorsLabel }}
        </button>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { computed } from 'vue'

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
  contributorsPanelId: {
    type: String,
    required: true
  },
  isContributorsOpen: {
    type: Boolean,
    required: true
  },
  descriptionSummaryLabel: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['zoom-in', 'zoom-out', 'set-language', 'toggle-description', 'toggle-contributors'])

const languageValue = computed({
  get: () => props.selectedLanguage,
  set: (value) => {
    emit('set-language', value)
  }
})

const quickControlsHeadingId = 'quick-controls-heading'
const quickControlsSectionLabel = computed(() => (props.inEnglish ? 'Diagram controls' : 'Controles del diagrama'))
const quickControlsToolbarLabel = computed(() => (props.inEnglish ? 'Primary diagram controls' : 'Controles principales del diagrama'))
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

#quick-controls .button {
  max-width: none;
}

.download-button {
  min-width: 2.4rem;
  min-height: 3rem;
  padding-left: 0.7rem;
  padding-right: 0.7rem;
}
</style>
