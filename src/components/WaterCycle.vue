<template>
  <div id="content-container">
    <h1
      class="diagram-title"
      :lang="inEnglish ? 'en' : 'es'"
    >
      {{ activeLongDescription.title }}
    </h1>
    <DiagramControls
      :in-english="inEnglish"
      :selected-language="selectedLanguage"
      :download-site="downloadSite"
      :download-aria-label="downloadAriaLabel"
      :current-language-download-text="currentLanguageDownloadText"
      description-panel-id="diagram-description-panel"
      :is-description-open="isDescriptionOpen"
      contributors-panel-id="diagram-contributors-panel"
      :is-contributors-open="isContributorsOpen"
      :description-summary-label="activeLongDescription.summaryLabel"
      @zoom-in="zoomIn"
      @zoom-out="zoomOut"
      @set-language="setLanguage"
      @toggle-description="toggleDescription"
      @toggle-contributors="toggleContributors"
    />
    <div
      id="image-zoomer"
      @wheel="handleWheel"
    >
      <div
        :style="zoomStyle"
        class="image-wrapper"
      >
        <picture
          v-show="inEnglish"
        >
          <source
            :srcset="imageSrcWebpEnglish"
            type="image/webp"
          >
          <source
            :srcset="imageSrcEnglish"
            type="image/png"
          >
          <img
            id="diagramEnglish"
            :src="imageSrcWebpEnglish"
            alt="Illustrated diagram of the water cycle showing the major pools and fluxes of water on Earth. The diagram depicts an idealized landscape with bright blue used to highlight key pools and fluxes and how they are connected."
            class="diagram-image"
            @load="onEnglishImageLoad"
          >
        </picture>

        <picture
          v-if="loadSpanish"
          v-show="!inEnglish"
        >
          <source
            :srcset="imageSrcWebpSpanish"
            type="image/webp"
          >
          <source
            :srcset="imageSrcSpanish"
            type="image/png"
          >
          <img
            id="diagramSpanish"
            :src="imageSrcWebpSpanish"
            alt="Diagrama ilustrado del ciclo del agua que muestra los principales reservorios y flujos de agua en la Tierra. El diagrama representa un paisaje idealizado en el que se usa azul brillante para destacar los reservorios y flujos clave y cómo están conectados."
            class="diagram-image"
          >
        </picture>
      </div>
      <div
        v-if="activeInfoPanel"
        class="info-overlay-backdrop"
        @click.self="closeInfoPanel"
        @wheel.prevent
      >
        <section
          v-if="isDescriptionOpen"
          id="diagram-description-panel"
          ref="descriptionDialogRef"
          class="info-overlay-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="diagram-description-panel-title"
          :lang="inEnglish ? 'en' : 'es'"
          tabindex="-1"
          @wheel.stop
        >
          <header>
            <h3 id="diagram-description-panel-title">
              {{ activeLongDescription.summaryLabel }}
            </h3>
            <button
              class="button control-action"
              :aria-label="closePanelLabel"
              @click="closeInfoPanel"
            >
              {{ closePanelText }}
            </button>
          </header>
          <div>
            <template v-if="activeLongDescription.sections.length > 0">
              <section
                v-for="(section, sectionIndex) in activeLongDescription.sections"
                :key="`long-description-section-${sectionIndex}`"
              >
                <h4>
                  {{ section.heading }}
                </h4>
                <p
                  v-for="(paragraph, paragraphIndex) in section.paragraphs"
                  :key="`long-description-paragraph-${sectionIndex}-${paragraphIndex}`"
                >
                  {{ paragraph }}
                </p>
              </section>
            </template>
            <p v-else-if="!inEnglish">
              La descripcion extensa en espanol estara disponible pronto.
            </p>
          </div>
        </section>
        <section
          v-else-if="isContributorsOpen"
          id="diagram-contributors-panel"
          ref="contributorsDialogRef"
          class="info-overlay-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="diagram-contributors-panel-title"
          :lang="inEnglish ? 'en' : 'es'"
          tabindex="-1"
          @wheel.stop
        >
          <header>
            <h3 id="diagram-contributors-panel-title">
              {{ contributorsLabel }}
            </h3>
            <button
              class="button control-action"
              :aria-label="closePanelLabel"
              @click="closeInfoPanel"
            >
              {{ closePanelText }}
            </button>
          </header>
          <div>
            <AuthorshipSection />
          </div>
        </section>
      </div>
    </div>
    <RelatedResources :in-english="inEnglish" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import DiagramControls from './DiagramControls.vue'
import RelatedResources from './RelatedResources.vue'
import AuthorshipSection from './AuthorshipSection.vue'
import diagramDescription from '@/assets/text/diagramDescription.json'

// zooom logic
const zoom = ref(1)
const descriptionDialogRef = ref(null)
const contributorsDialogRef = ref(null)

const zoomStyle = computed(() => ({
  transform: `scale(${zoom.value})`,
  transformOrigin: 'center center',
  transition: 'transform 0.1s ease-out'
}))

const MIN_ZOOM = 1
const MAX_ZOOM = 5
const ZOOM_STEP = 0.1

const handleWheel = (e) => {
  if (activeInfoPanel.value) return
  e.preventDefault()
  const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
  zoom.value = Math.min(Math.max(zoom.value + delta, MIN_ZOOM), MAX_ZOOM)
}

function zoomIn() {
  zoom.value = Math.min(zoom.value + ZOOM_STEP, MAX_ZOOM)
}

function zoomOut() {
  zoom.value = Math.max(zoom.value - ZOOM_STEP, MIN_ZOOM)
}

// handle languages and text
const loadSpanish = ref(false)
const inEnglish = ref(true)
const selectedLanguage = ref('en')
const imageSrcEnglish = ref(null)
const imageSrcWebpEnglish = ref(null)
const imageSrcSpanish = ref(null)
const imageSrcWebpSpanish = ref(null)
const currentLanguageDownloadText = ref(null)
const englishLongDescription = diagramDescription.en
const spanishLongDescription = diagramDescription.es
const activeLongDescription = computed(() => (inEnglish.value ? englishLongDescription : spanishLongDescription))

// diagram controls 
const downloadSite = ref(null)
const activeInfoPanel = ref(null)
const isDescriptionOpen = computed(() => activeInfoPanel.value === 'description')
const isContributorsOpen = computed(() => activeInfoPanel.value === 'contributors')
const contributorsLabel = computed(() => (inEnglish.value ? 'Contributors' : 'Colaboradores'))
const closePanelText = computed(() => (inEnglish.value ? 'Close' : 'Cerrar'))
const closePanelLabel = computed(() => (inEnglish.value ? 'Close panel' : 'Cerrar panel'))
const downloadAriaLabel = computed(() => {
  if (inEnglish.value) {
    return 'Download the diagram, opens in new tab'
  }
  return 'Descargar el diagrama, se abre en una nueva pestana'
})

// designing for screen readers and tab navigation

// add keyboard focus to all selectable elements in dialogs (links, buttons, inputs)
// https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/dialog/ 
// this applies focus to elements within the dialog box and adds a tab loop within the dialog
// when dialog closes, returns to original focus opening button 
const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// select the open dialog box
function getActiveDialogElement() {
  return isDescriptionOpen.value
    ? descriptionDialogRef.value
    : isContributorsOpen.value
      ? contributorsDialogRef.value
      : null
}

// return a list of focusable elements (links, buttons, inputs)
function getFocusableElements(container) {
  if (!container) return []
  return [...container.querySelectorAll(FOCUSABLE_SELECTOR)]
    .filter((element) => element.getClientRects().length > 0)
}

// when dialog opens apply focus to first element
function focusActiveDialog() {
  const dialog = getActiveDialogElement()
  if (!dialog) return
  const focusable = getFocusableElements(dialog)
  if (focusable.length > 0) {
    focusable[0].focus()
    return
  }
  dialog.focus()
}

// handle keyboard nav within dialog boxes (contributors and description)
// when dialog is open create list of focusable items and allow tab nav through them
function handleDialogKeydown(element) {
  if (!activeInfoPanel.value) return

  const dialog = getActiveDialogElement()
  if (!dialog) return

  // escape closes dialog
  if (element.key === 'Escape') {
    element.preventDefault()
    closeInfoPanel()
    return
  }

  if (element.key !== 'Tab') return

  // list of tabbed elements
  const focusable = getFocusableElements(dialog)
  if (focusable.length === 0) {
    element.preventDefault()
    dialog.focus()
    return
  }

  // start with first element and cycle through
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  const activeElement = document.activeElement
  const focusInsideDialog = dialog.contains(activeElement)

  if (!focusInsideDialog) {
    element.preventDefault()
    first.focus()
    return
  }

  if (element.shiftKey && activeElement === first) {
    element.preventDefault()
    last.focus()
    return
  }

  // on last element loop back to the first element when tabbed
  if (!element.shiftKey && activeElement === last) {
    element.preventDefault()
    first.focus()
  }
}

onMounted(() => {
  setLanguage('en')

  imageSrcEnglish.value = 'https://labs.waterdata.usgs.gov/visualizations/images/USGS_WaterCycle_English_ONLINE.png'
  imageSrcWebpEnglish.value = 'https://labs.waterdata.usgs.gov/visualizations/images/USGS_WaterCycle_English_ONLINE.webp'
  imageSrcSpanish.value = 'https://labs.waterdata.usgs.gov/visualizations/images/USGS_WaterCycle_Spanish_ONLINE.png'
  imageSrcWebpSpanish.value = 'https://labs.waterdata.usgs.gov/visualizations/images/USGS_WaterCycle_Spanish_ONLINE.webp'
})

watch(activeInfoPanel, async (panel) => {
  document.removeEventListener('keydown', handleDialogKeydown, true)

  if (panel) {
    await nextTick() // wait for dialog to be added to DOM
    focusActiveDialog() // move focus to dialog
    document.addEventListener('keydown', handleDialogKeydown, true) // listen to keys
    return
  }

  await nextTick()
  document.getElementById('description-toggle')?.focus()
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleDialogKeydown, true)
})

function onEnglishImageLoad() {
  // Load Spanish diagram in background after English image is ready.
  loadSpanish.value = true
}

// switch the app language state and downloadable file
function setLanguage(languageCode) {
  selectedLanguage.value = languageCode
  inEnglish.value = languageCode === 'en'

  if (inEnglish.value) {
    currentLanguageDownloadText.value = 'Download the diagram'
    downloadSite.value = 'https://d9-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/media/files/gip221_english.pdf'
  } else {
    currentLanguageDownloadText.value = 'Descargar el diagrama'
    downloadSite.value = 'https://d9-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/media/files/gip221_spanish.pdf'
  }
}

// toggle dialogs
function toggleDescription() {
  activeInfoPanel.value = isDescriptionOpen.value ? null : 'description'
}

function toggleContributors() {
  activeInfoPanel.value = isContributorsOpen.value ? null : 'contributors'
}

function closeInfoPanel() {
  activeInfoPanel.value = null
}
</script>

<style scoped lang="scss">
#image-zoomer {
  height: 88vh;
  overflow: hidden;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  @media screen and (max-height: 900px) {
    height: 84vh;
  }
  @media screen and (max-height: 770px) {
    height: 80vh;
  }
  @media screen and (max-height: 700px) {
    height: 85vh;
  }
  @media screen and (max-height: 500px) {
    height: 50vh;
  }
  @media screen and (max-width: 400px) {
    height: 65vh;
  }
}
.image-wrapper {
  display: inline-block;
}
.diagram-image {
  width: 100%;
  height: auto;
}
.info-overlay-backdrop {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.2);
}
.info-overlay-panel {
  width: min(80rem, 100%);
  max-height: 100%;
  overflow: auto;
  overscroll-behavior: contain;
  background: #ffffff;
  border: 1px solid #949494;
  border-radius: 0.4rem;
}
.info-overlay-panel > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #d8d8d8;
}
.info-overlay-panel > header h3 {
  margin: 0;
  padding: 0;
  font-family: var(--style-font);
  font-size: 1.1em;
  font-weight: 600;
}
.info-overlay-panel > header + div {
  padding: 0.5rem 1rem 1rem 1rem;
}
.info-overlay-panel section {
  margin-bottom: 1rem;
}
.info-overlay-panel h4 {
  font-size: 1.1em;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.info-overlay-panel > header + div p {
  margin-bottom: 0.5rem;
}
</style>
