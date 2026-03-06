<template>
  <div id="content-container">
    <h1
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
      :is-description-open="isDescriptionOpen"
      :is-contributors-open="isContributorsOpen"
      :description-summary-label="activeLongDescription.summaryLabel"
      @zoom-in="zoomIn"
      @zoom-out="zoomOut"
      @set-language="setLanguage"
      @toggle-description="toggleDescription"
      @toggle-contributors="toggleContributors"
    />
    <p
      class="zoom-instruction"
      :lang="inEnglish ? 'en' : 'es'"
    >
      {{ wheelZoomInstruction }}
    </p>
    <div
      id="image-zoomer"
      ref="zoomContainer"
      @wheel="handleWheel"
    >
      <div
        ref="imageWrapper"
        :style="zoomStyle"
        class="image-wrapper"
        @pointerdown="handlePointerDown"
        @dragstart.prevent
        @touchstart.passive="handleTouchStart"
        @touchmove.prevent="handleTouchMove"
        @touchend="handleTouchEnd"
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
            draggable="false"
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
            draggable="false"
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
const MIN_ZOOM = 0.7
const MAX_ZOOM = 5
const zoomContainer = ref(null)
const imageWrapper = ref(null)
const transformOrigin = ref('center center')
const descriptionDialogRef = ref(null)
const contributorsDialogRef = ref(null)

// drag to pan
const pan = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

// mobile pinch zoom tracking
const initialPinchDistance = ref(null)
const initialZoom = ref(zoom.value)

// mbile single finer drag
const isTouchDragging = ref(false)
const touchStart = ref({ x: 0, y: 0 })

// button zoom
function zoomIn() {
  zoom.value = Math.min(zoom.value + 0.1, MAX_ZOOM)
  pan.value = clampPan(pan.value.x, pan.value.y)

}

function zoomOut() {
  zoom.value = Math.max(zoom.value - 0.1, MIN_ZOOM)
  pan.value = clampPan(pan.value.x, pan.value.y)

}

// zooming with drag to pan when zoomed in
const zoomStyle = computed(() => ({
  transform: `translate(${pan.value.x}px, ${pan.value.y}px) scale(${zoom.value})`,
  transformOrigin: transformOrigin.value,
  transition: isDragging.value ? 'none' : 'transform 0.1s ease-out',
  cursor: isDragging.value ? 'grabbing' : 'grab',
  userSelect: 'none',
}))


// center zoom on cursor
const handleWheel = (e) => {
  const isModifiedWheel = e.ctrlKey || e.metaKey
  if (!isModifiedWheel) return

  e.preventDefault()

  const rect = e.currentTarget.getBoundingClientRect()
  const offsetX = e.clientX - rect.left
  const offsetY = e.clientY - rect.top

  const percentX = (offsetX / rect.width) * 100
  const percentY = (offsetY / rect.height) * 100
  transformOrigin.value = `${percentX}% ${percentY}%`

  const delta = e.deltaY > 0 ? -0.1 : 0.1
  zoom.value = Math.min(Math.max(zoom.value + delta, MIN_ZOOM), MAX_ZOOM)

  // reset zoom center when at 1
  if (zoom.value === 1) {
    pan.value = { x: 0, y: 0 }
    transformOrigin.value = 'center center'
  }
}

// pointer handlers to allow desktop drag-pan
const handlePointerDown = (e) => {
  if (e.pointerType !== 'mouse' || e.button !== 0) return

  e.preventDefault()
  stopDragging()

  isDragging.value = true
  dragStart.value = {
    x: e.clientX - pan.value.x,
    y: e.clientY - pan.value.y
  }
  imageWrapper.value?.setPointerCapture?.(e.pointerId)

  window.addEventListener('pointermove', handlePointerMove)
  window.addEventListener('pointerup', handlePointerUp)
  window.addEventListener('pointercancel', handlePointerUp)
  window.addEventListener('blur', handlePointerUp)
}

const handlePointerMove = (e) => {
  if (!isDragging.value || e.pointerType !== 'mouse') return
  const rawX = e.clientX - dragStart.value.x
  const rawY = e.clientY - dragStart.value.y
  pan.value = clampPan(rawX, rawY)
}

function stopDragging() {
  isDragging.value = false
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerup', handlePointerUp)
  window.removeEventListener('pointercancel', handlePointerUp)
  window.removeEventListener('blur', handlePointerUp)
}

const handlePointerUp = (e) => {
  if (e && e.pointerType && e.pointerType !== 'mouse') return
  stopDragging()
}

// dont' scroll beyond the edges of the diagram...
function clampPan(panX, panY) {
  if (!zoomContainer.value || !imageWrapper.value) return { x: panX, y: panY }

  const container = zoomContainer.value.getBoundingClientRect()

  const scale = zoom.value

  const scaledWidth = imageWrapper.value.offsetWidth * scale
  const scaledHeight = imageWrapper.value.offsetHeight * scale

  const overflowX = Math.abs(scaledWidth - container.width) / 2
  const overflowY = Math.abs(scaledHeight - container.height) / 2
  const minPanRangeX = scale <= 1 ? container.width * 0.25 : 0
  const minPanRangeY = scale <= 1 ? container.height * 0.25 : 0
  const maxX = Math.max(overflowX, minPanRangeX)
  const maxY = Math.max(overflowY, minPanRangeY)

  return {
    x: Math.max(Math.min(panX, maxX), -maxX),
    y: Math.max(Math.min(panY, maxY), -maxY)
  }
}

// on mobile calculate distance between fingers on screen
function getTouchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX
  const dy = touches[0].clientY - touches[1].clientY
  return Math.sqrt(dx * dx + dy * dy)
}

// get the midpoint between finger touches
function getTouchMidpoint(touches) {
  return {
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2
  }
}

// use touchpoints to drive zoom
const handleTouchStart = (e) => {

  // if two fingers, pinch zoom
  if (e.touches.length === 2) {
    initialPinchDistance.value = getTouchDistance(e.touches)
    initialZoom.value = zoom.value

    // calculate midpoint relative to container
    const rect = zoomContainer.value.getBoundingClientRect()
    const midpoint = getTouchMidpoint(e.touches)
    const offsetX = midpoint.x - rect.left
    const offsetY = midpoint.y - rect.top

    const percentX = (offsetX / rect.width) * 100
    const percentY = (offsetY / rect.height) * 100

    transformOrigin.value = `${percentX}% ${percentY}%`

     // if just one finger, allow drag effect
  } else if (e.touches.length === 1) {
    isTouchDragging.value = true
    touchStart.value = {
      x: e.touches[0].clientX - pan.value.x,
      y: e.touches[0].clientY - pan.value.y
    }
  }
}

const handleTouchMove = (e) => {
  // if two fingers, pinch zoom
  if (e.touches.length === 2 && initialPinchDistance.value) {
    e.preventDefault() // prevent scrolling
    const newDistance = getTouchDistance(e.touches)
    const scaleChange = newDistance / initialPinchDistance.value
    zoom.value = Math.min(Math.max(initialZoom.value * scaleChange, MIN_ZOOM), MAX_ZOOM)

    // clamp pan after zoom
    pan.value = clampPan(pan.value.x, pan.value.y)

    // if just one finger, allow drag effect
  } else if (e.touches.length === 1 && isTouchDragging.value) {
    const x = e.touches[0].clientX - touchStart.value.x
    const y = e.touches[0].clientY - touchStart.value.y
    pan.value = clampPan(x, y)
  }
}

const handleTouchEnd = () => {
  initialPinchDistance.value = null
  isTouchDragging.value = false
}


// handling languages and buttons
const loadEnglish = ref(true)
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
const wheelZoomInstruction = computed(() => (
  inEnglish.value
    ? 'Hold Ctrl or Cmd and scroll to zoom the diagram'
    : 'Mantenga presionada la tecla Ctrl o Cmd y desplacese para acercar. English is the official language and authoritative version of all federal information.'
))
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
  stopDragging()
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
#content-container {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;
  min-height: 0;
}

.zoom-instruction {
  margin: 0.5rem 0 0.75rem 0;
  padding: 0 1.5rem;
  font-style: italic;
}

#image-zoomer {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  align-items: center;
  justify-content: center;
}
.image-wrapper {
  display: inline-block;
  max-width: 100%;
  max-height: 100%;
}
.diagram-image {
  display: block;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
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

@media screen and (max-width: 600px) {
  .zoom-instruction {
    padding: 0 1rem;
  }
}
</style>
