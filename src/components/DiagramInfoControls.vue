<template>
  <section
    id="diagram-info-controls"
    aria-labelledby="diagram-info-controls-heading"
  >
    <h2
      id="diagram-info-controls-heading"
      class="only"
    >
      {{ sectionLabel }}
    </h2>
    <ul
      class="control-list no-separators"
      role="toolbar"
      aria-labelledby="diagram-info-controls-heading"
    >
      <li class="control-item">
        <span class="control-prefix download-prefix">{{ downloadLabel }}</span>
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
      <li class="control-item more-info-group">
        <span class="control-prefix">{{ moreInfoLabel }}</span>
        <button
          id="description-toggle"
          class="button control-action"
          aria-controls="diagram-description-panel"
          :aria-expanded="isDescriptionOpen ? 'true' : 'false'"
          @click="emit('toggle-description')"
        >
          {{ descriptionSummaryLabel }}
        </button>
        <button
          class="button control-action"
          aria-controls="diagram-contributors-panel"
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
  isDescriptionOpen: {
    type: Boolean,
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

const emit = defineEmits(['toggle-description', 'toggle-contributors'])

const sectionLabel = computed(() => (props.inEnglish ? 'Diagram download and information' : 'Descarga e informacion del diagrama'))
const downloadLabel = computed(() => (props.inEnglish ? 'Download:' : 'Descargar:'))
const moreInfoLabel = computed(() => (props.inEnglish ? 'More info:' : 'Mas informacion:'))
const contributorsLabel = computed(() => (props.inEnglish ? 'Contributors' : 'Colaboradores'))
</script>
