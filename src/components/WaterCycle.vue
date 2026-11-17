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
      :is-interactive="isInteractive"
      :selected-level="selectedLevel"
      @zoom-in="zoomIn"
      @zoom-out="zoomOut"
      @set-language="setLanguage"
      @set-interactive="setInteractive"
      @set-level="setLevel"
    />
    <p
      v-if="!isMobile"
      class="zoom-instruction"
      :lang="inEnglish ? 'en' : 'es'"
    >
      {{ wheelZoomInstruction }}
    </p>
    <div
      id="diagram-layout"
    >
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
          @click.capture="handleWrapperClickCapture"
          @dragstart.prevent
          @touchstart.passive="handleTouchStart"
          @touchmove.prevent="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <WaterCycleLabels
            :language="selectedLanguage"
            :level="selectedLevel"
            :interactive="labelsInteractive"
            :selected-id="selectedTerm?.id ?? null"
            @term-select="onTermSelect"
            @term-deselect="onTermDeselect"
          />
        </div>
        <div
          v-if="activeInfoPanel"
          class="info-overlay-backdrop"
          @click.self="closeInfoPanel"
          @wheel="handleBackdropWheel"
        >
          <DialogBox
            v-if="isDescriptionOpen"
            id="diagram-description-panel"
            ref="descriptionDialogRef"
            title-id="diagram-description-panel-title"
            :title="activeLongDescription.summaryLabel"
            :lang="inEnglish ? 'en' : 'es'"
            :close-label="closePanelLabel"
            :close-text="closePanelText"
            @close="closeInfoPanel"
          >
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
          </DialogBox>
          <DialogBox
            v-else-if="isContributorsOpen"
            id="diagram-contributors-panel"
            ref="contributorsDialogRef"
            title-id="diagram-contributors-panel-title"
            :title="contributorsLabel"
            :lang="inEnglish ? 'en' : 'es'"
            :close-label="closePanelLabel"
            :close-text="closePanelText"
            @close="closeInfoPanel"
          >
            <AuthorshipSection />
          </DialogBox>
        </div>
      </div>
      <TermPanel
        v-if="labelsInteractive"
        class="diagram-term-panel"
        :term="selectedTerm"
        :language="selectedLanguage"
        @close="onTermDeselect"
      />
    </div>
    <DiagramInfoControls
      :in-english="inEnglish"
      :download-site="downloadSite"
      :download-aria-label="downloadAriaLabel"
      :current-language-download-text="currentLanguageDownloadText"
      :is-description-open="isDescriptionOpen"
      :is-contributors-open="isContributorsOpen"
      :description-summary-label="activeLongDescription.summaryLabel"
      @toggle-description="toggleDescription"
      @toggle-contributors="toggleContributors"
    />
    <RelatedResources :in-english="inEnglish" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isMobile } from 'mobile-device-detect'
import DiagramControls from './DiagramControls.vue'
import DiagramInfoControls from './DiagramInfoControls.vue'
import DialogBox from './DialogBox.vue'
import RelatedResources from './RelatedResources.vue'
import AuthorshipSection from './AuthorshipSection.vue'
import WaterCycleLabels from './WaterCycleLabels.vue'
import TermPanel from './TermPanel.vue'
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
// Distinguish a click (select a label) from a drag (pan the diagram) on
// desktop. We only begin panning once the pointer moves past this threshold,
// so a stationary mouse-down/up still dispatches a native click to the label.
const DRAG_THRESHOLD_PX = 4
const pointerDownPos = ref(null)
const hasDragged = ref(false)
let activePointerId = null

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

const handleBackdropWheel = (e) => {
  if (!e.ctrlKey && !e.metaKey) return

  e.preventDefault()
  e.stopPropagation()
}

// pointer handlers to allow desktop drag-pan
const handlePointerDown = (e) => {
  if (e.pointerType !== 'mouse' || e.button !== 0) return

  // Do NOT preventDefault or capture the pointer yet. If this turns out to be a
  // plain click (no movement), the browser must be free to dispatch a native
  // click to the label underneath. We only commit to a drag once the pointer
  // moves past DRAG_THRESHOLD_PX (see handlePointerMove).
  stopDragging()

  hasDragged.value = false
  activePointerId = e.pointerId
  pointerDownPos.value = { x: e.clientX, y: e.clientY }
  dragStart.value = {
    x: e.clientX - pan.value.x,
    y: e.clientY - pan.value.y
  }

  window.addEventListener('pointermove', handlePointerMove)
  window.addEventListener('pointerup', handlePointerUp)
  window.addEventListener('pointercancel', handlePointerUp)
  window.addEventListener('blur', handlePointerUp)
}

const handlePointerMove = (e) => {
  if (e.pointerType !== 'mouse' || !pointerDownPos.value) return

  // Promote to a real drag the first time movement passes the threshold.
  if (!isDragging.value) {
    const dx = e.clientX - pointerDownPos.value.x
    const dy = e.clientY - pointerDownPos.value.y
    if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return
    isDragging.value = true
    hasDragged.value = true
    imageWrapper.value?.setPointerCapture?.(activePointerId)
  }

  e.preventDefault()
  const rawX = e.clientX - dragStart.value.x
  const rawY = e.clientY - dragStart.value.y
  pan.value = clampPan(rawX, rawY)
}

function stopDragging() {
  isDragging.value = false
  pointerDownPos.value = null
  if (activePointerId !== null) {
    imageWrapper.value?.releasePointerCapture?.(activePointerId)
    activePointerId = null
  }
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerup', handlePointerUp)
  window.removeEventListener('pointercancel', handlePointerUp)
  window.removeEventListener('blur', handlePointerUp)
}

const handlePointerUp = (e) => {
  if (e && e.pointerType && e.pointerType !== 'mouse') return
  stopDragging()
}

// A drag release still fires a native `click`; swallow that one in the capture
// phase so dragging the diagram doesn't select/deselect a label. A plain click
// (no drag) passes through to WaterCycleLabels untouched.
const handleWrapperClickCapture = (e) => {
  if (hasDragged.value) {
    e.stopPropagation()
    e.preventDefault()
    hasDragged.value = false
  }
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
const SUPPORTED_LANGUAGES = ['en', 'es']
const DEFAULT_LANGUAGE = 'en'
const route = useRoute()
const router = useRouter()
const inEnglish = ref(true)
const selectedLanguage = ref('en')
const currentLanguageDownloadText = ref(null)
const englishLongDescription = diagramDescription.en
const spanishLongDescription = diagramDescription.es
const activeLongDescription = computed(() => (inEnglish.value ? englishLongDescription : spanishLongDescription))

// diagram controls 
// Interactivity (click a label to open its definition) and version
// (beginner/advanced definitions) are English-only for now, so Spanish always
// shows the static diagram.
const isInteractive = ref(true)
const selectedLevel = ref('advanced')
const labelsInteractive = computed(() => inEnglish.value && isInteractive.value)

function setInteractive(value) {
  isInteractive.value = Boolean(value)
  if (!isInteractive.value) selectedTerm.value = null
}

// Close the term panel on a version switch so a definition from the other
// level does not linger.
function setLevel(level) {
  if (!['beginner', 'advanced'].includes(level) || level === selectedLevel.value) return
  selectedLevel.value = level
  selectedTerm.value = null
}

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
    ? descriptionDialogRef.value?.dialogElement ?? null
    : isContributorsOpen.value
      ? contributorsDialogRef.value?.dialogElement ?? null
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

  if (isDescriptionOpen.value) {
    const descriptionContent = descriptionDialogRef.value?.dialogContentElement ?? null
    if (descriptionContent) {
      descriptionContent.focus()
      return
    }
  }

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
  setLanguage(resolveInitialLanguage())
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

// Selected term state for the side/bottom panel. The panel lives outside the
// zoom/pan transform (as a sibling of the diagram) so its text stays unscaled
// and legible regardless of zoom level.
const selectedTerm = ref(null)

function onTermSelect(payload) {
  selectedTerm.value = payload
}

function onTermDeselect() {
  selectedTerm.value = null
}

// normalize an arbitrary language string to a supported code, or null
function normalizeLanguage(languageCode) {
  if (!languageCode) return null
  // handle values like "es-MX" or "EN" by taking the base subtag
  const base = String(languageCode).toLowerCase().split('-')[0]
  return SUPPORTED_LANGUAGES.includes(base) ? base : null
}

// decide which language to start in based on the path (e.g. /en, /es).
// The router redirects "/" to the browser-preferred language, so by the time
// this component mounts the path param is already populated.
function resolveInitialLanguage() {
  return normalizeLanguage(route.params.lang) ?? DEFAULT_LANGUAGE
}

// keep the URL path in sync with the selected language
function syncLanguageToUrl(languageCode) {
  if (route.params.lang === languageCode) return
  router.push({
    name: 'VisualizationContent',
    params: { lang: languageCode }
  })
}

// switch the app language state and downloadable file
function setLanguage(languageCode) {
  const normalized = normalizeLanguage(languageCode) ?? DEFAULT_LANGUAGE
  const changed = normalized !== selectedLanguage.value
  selectedLanguage.value = normalized
  inEnglish.value = normalized === 'en'

  // Close the term panel on a language switch so a stale (wrong-language)
  // definition does not linger.
  if (changed) selectedTerm.value = null

  if (inEnglish.value) {
    currentLanguageDownloadText.value = 'Download the diagram'
    downloadSite.value = 'https://d9-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/media/files/gip221_english.pdf'
  } else {
    currentLanguageDownloadText.value = 'Descargar el diagrama'
    downloadSite.value = 'https://d9-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/media/files/gip221_spanish.pdf'
  }

  syncLanguageToUrl(normalized)
}

// react to URL changes (e.g. browser back/forward, shared links)
watch(() => route.params.lang, (newLang) => {
  const normalized = normalizeLanguage(newLang)
  if (normalized && normalized !== selectedLanguage.value) {
    setLanguage(normalized)
  }
})

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

/* Diagram and term panel sit side by side on desktop and stack (panel on the
   bottom) on narrow screens. */
#diagram-layout {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  gap: 1rem;
  padding: 0 1.5rem 1rem 1.5rem;
}

#image-zoomer {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
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

/* Desktop: right-hand sidebar for the selected term.*/
.diagram-term-panel {
  flex: 0 0 26rem;
  max-width: 26rem;
  align-self: stretch;
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

@media screen and (max-width: 600px) {
  .zoom-instruction {
    padding: 0 1rem;
  }

  /* Mobile: stack the panel beneath the diagram like a bottom sheet. */
  #diagram-layout {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0 0.5rem 0.5rem 0.5rem;
  }

  .diagram-term-panel {
    flex: 0 0 auto;
    max-width: 100%;
    align-self: auto;
    max-height: 45vh;
  }
}
</style>


