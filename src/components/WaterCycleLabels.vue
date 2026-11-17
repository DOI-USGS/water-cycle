<template>
  <div
    ref="root"
    class="wc-diagram-layers"
    :class="{ 'wc-diagram-layers--static': !interactive }"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <!-- Layer 1: background artwork (non-interactive raster, language-neutral) -->
    <img
      class="wc-layer wc-layer--background"
      :src="backgroundSrc"
      alt="Illustrated diagram of the water cycle showing the major pools and fluxes of water on Earth."
      draggable="false"
      @load="handleBackgroundLoad"
    >

    <!-- Layer 2: arrows (non-interactive, decorative, language-neutral) -->
    <img
      class="wc-layer wc-layer--arrows"
      :src="arrowsSrc"
      alt=""
      aria-hidden="true"
      draggable="false"
    >

    <!-- Layer 3: interactive labels. vite-svg-loader renders this inline as
         real DOM so we can attach click/keyboard handlers to [data-term].
         :key forces a re-render (and re-application of a11y attributes) when
         the language changes, once a language-specific SVG is provided. -->
    <component
      :is="activeLabelsSvg"
      :key="language"
      class="wc-layer wc-layer--labels"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import LabelsSvgEn from '@/assets/images/WCD_all_labels.svg?component'
// When the Spanish labels SVG is available, import it here and wire it into
// `activeLabelsSvg` below:
//   import LabelsSvgEs from '@/assets/images/WCD_all_labels_es.svg?component'
import backgroundSrc from '@/assets/images/WCD_image_background.png'
import arrowsSrc from '@/assets/images/WCD_all_arrows.svg?url'
import terms from '@/assets/text/terms.json'

const props = defineProps({
  // Current app language ('en' | 'es'). Drives which definitions are shown and
  // (eventually) which labels SVG is rendered.
  language: {
    type: String,
    default: 'en'
  },
  // Audience level ('beginner' | 'advanced'). Current scope: advanced.
  level: {
    type: String,
    default: 'advanced'
  },
  // Id of the currently selected term (owned by the parent). Drives which
  // cluster is highlighted, so selection state and the side panel stay in sync.
  selectedId: {
    type: String,
    default: null
  },
  // When false the labels are part of a static image: no click-to-open
  // definitions, no tab stops, and no pointer cursor.
  interactive: {
    type: Boolean,
    default: true
  }
})

// Emits the selected term so the parent can populate the side panel. A second
// click on the same label (or a click on empty diagram space) emits a
// deselect.
const emit = defineEmits(['term-select', 'term-deselect'])

const root = ref(null)

// Select the labels SVG for the active language. Until a Spanish SVG exists we
// render the English artwork for both languages (definitions still localize via
// the `language` prop). To enable Spanish labels, import LabelsSvgEs above and
// return it for 'es' here.
const activeLabelsSvg = computed(() => {
  switch (props.language) {
    // case 'es': return LabelsSvgEs
    default: return LabelsSvgEn
  }
})

// Sentence-case the main label to match the diagram ("Precipitation", not
// "Precipitation Over Land"); the qualifier keeps its lowercase JSON text.
function capitalizeFirst(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : ''
}

function labelFor(termId) {
  const entry = terms[termId]
  return capitalizeFirst(entry?.label ?? termId)
}

function qualifierFor(termId) {
  return terms[termId]?.qualifier ?? ''
}

function titleFor(termId) {
  return [labelFor(termId), qualifierFor(termId)].filter(Boolean).join(', ')
}

function definitionFor(termId) {
  const entry = terms[termId]
  return entry?.definitions?.[props.language]?.[props.level] ?? ''
}

function labelElFromTarget(target) {
  return target instanceof Element ? target.closest('[data-term]') : null
}

// --- Label clusters ---------------------------------------------------------
// One visual label is often several [data-term] elements: a main label and a
// qualifier on separate lines ("Wetlands" / "fresh"), plus white-halo
// duplicates stacked underneath. Elements that share a term and sit next to
// each other are treated as one cluster so they highlight and take keyboard
// focus as a single unit. The same term can also appear in distant places
// (e.g. two "Groundwater" labels); those stay separate clusters.

// Two rects are "adjacent" if the gap between them is under ~3/4 of a line.
function rectsAdjacent(a, b) {
  const tolerance = 0.75 * Math.min(a.height, b.height)
  const dx = Math.max(0, Math.max(a.left, b.left) - Math.min(a.right, b.right))
  const dy = Math.max(0, Math.max(a.top, b.top) - Math.min(a.bottom, b.bottom))
  return dx <= tolerance && dy <= tolerance
}

// All same-term elements transitively adjacent to `labelEl`, in DOM order.
function clusterFor(labelEl) {
  const termId = labelEl.getAttribute('data-term')
  const candidates = [...(root.value?.querySelectorAll(`[data-term="${CSS.escape(termId)}"]`) ?? [])]
  const rects = new Map(candidates.map((el) => [el, el.getBoundingClientRect()]))
  const cluster = new Set([labelEl])
  let grew = true
  while (grew) {
    grew = false
    for (const el of candidates) {
      if (cluster.has(el)) continue
      if ([...cluster].some((member) => rectsAdjacent(rects.get(member), rects.get(el)))) {
        cluster.add(el)
        grew = true
      }
    }
  }
  return candidates.filter((el) => cluster.has(el))
}

// --- Selection highlight ----------------------------------------------------
const ACTIVE_CLASS = 'is-active'
let activeCluster = []

function clearHighlight() {
  activeCluster.forEach((el) => el.classList.remove(ACTIVE_CLASS))
  activeCluster = []
}

// Highlight the cluster for a given term id (the first tagged element wins).
function highlightTerm(termId) {
  clearHighlight()
  if (!termId) return
  const first = root.value?.querySelector(`[data-term="${CSS.escape(termId)}"]`)
  if (!first) return
  activeCluster = clusterFor(first)
  activeCluster.forEach((el) => el.classList.add(ACTIVE_CLASS))
}

// Toggle selection: clicking the already-selected label closes the panel.
function selectLabel(labelEl) {
  if (!props.interactive) return
  const termId = labelEl.getAttribute('data-term')
  if (!termId) return

  if (termId === props.selectedId) {
    emit('term-deselect')
    return
  }

  const definition = definitionFor(termId)
  if (!definition) {
    emit('term-deselect')
    return
  }

  emit('term-select', {
    id: termId,
    title: titleFor(termId),
    label: labelFor(termId),
    qualifier: qualifierFor(termId),
    definition
  })
}

function handleClick(event) {
  const labelEl = labelElFromTarget(event.target)
  if (labelEl) {
    selectLabel(labelEl)
    return
  }
  // Click on empty diagram space clears the current selection.
  if (props.selectedId) emit('term-deselect')
}

function handleKeydown(event) {
  if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return
  const labelEl = labelElFromTarget(event.target)
  if (!labelEl) return
  event.preventDefault()
  selectLabel(labelEl)
}

// Make tagged labels keyboard-focusable and screen-reader friendly without
// re-editing the generated SVG. Only the first element of each cluster gets a
// tab stop and accessible name; the rest (qualifier lines, halo duplicates) are
// hidden from assistive tech so each label is announced once. Clustering needs
// real layout, so this re-runs once the background image has sized the
// container, and again whenever the inline SVG re-renders (language switch).
function applyLabelAccessibility() {
  const labels = [...(root.value?.querySelectorAll('[data-term]') ?? [])]
  if (!props.interactive) {
    // Static image: the background <img> alt text describes the diagram, so
    // hide the label layer from assistive tech and remove the tab stops.
    labels.forEach((el) => {
      el.style.cursor = ''
      el.removeAttribute('tabindex')
      el.removeAttribute('role')
      el.removeAttribute('aria-label')
      el.setAttribute('aria-hidden', 'true')
    })
    highlightTerm(null)
    return
  }
  const secondary = new Set()
  labels.forEach((el) => {
    el.style.cursor = 'pointer'
    if (secondary.has(el)) {
      el.removeAttribute('tabindex')
      el.removeAttribute('role')
      el.removeAttribute('aria-label')
      el.setAttribute('aria-hidden', 'true')
      return
    }
    clusterFor(el).forEach((member) => member !== el && secondary.add(member))
    const termId = el.getAttribute('data-term')
    el.removeAttribute('aria-hidden')
    el.setAttribute('tabindex', '0')
    el.setAttribute('role', 'button')
    el.setAttribute('aria-label', `${titleFor(termId)}. ${definitionFor(termId)}`)
  })
  // Re-apply the highlight in case the SVG just re-rendered.
  highlightTerm(props.selectedId)
}

function handleBackgroundLoad() {
  applyLabelAccessibility()
}

onMounted(applyLabelAccessibility)

// Keep the highlight in sync when the parent changes the selection (e.g. the
// panel's X button clears it).
watch(() => props.selectedId, (id) => highlightTerm(id))

// Re-apply after the SVG re-renders for a new language, or when the version or
// interactivity changes (aria-labels include the level-specific definition).
watch(() => [props.language, props.level, props.interactive], async () => {
  await nextTick()
  applyLabelAccessibility()
})
</script>

<style scoped lang="scss">
/* The background image is in normal flow and drives the component intrinsic
   size (mirrors the original diagram img rules). The container shrink-wraps
   that rendered size so the absolutely-positioned arrows and labels overlay it
   exactly (all three share the same artboard). */
.wc-diagram-layers {
  position: relative;
  display: inline-block;
  max-width: 100%;
  max-height: 100%;
  line-height: 0; /* remove inline-block baseline gap under the image */
}

.wc-layer--background {
  display: block;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  pointer-events: none;
  user-select: none;
}

.wc-layer--arrows,
.wc-layer--labels {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.wc-layer--arrows {
  object-fit: contain;
  pointer-events: none;
  user-select: none;
  z-index: 2;
}

.wc-layer--labels {
  z-index: 3;
}
.wc-layer--background {
  z-index: 1;
}

.wc-layer--labels :deep([data-term]) {
  transition: opacity 0.1s ease-out;
  /* The exported label text uses fill:none plus stroke (a white halo), so the
     default SVG hit-testing (visiblePainted) only responds on the thin strokes,
     leaving dead zones inside letters and between words. Force the whole label
     area to be clickable. */
  pointer-events: all;
}

.wc-layer--labels :deep([data-term] text),
.wc-layer--labels :deep([data-term] tspan) {
  pointer-events: all;
}

/* Highlight is driven by the .is-active class (set on every element in the
   selected cluster) rather than the hover state, so a label and its qualifier
   light up together and stay lit while the panel is open. */
.wc-layer--labels :deep([data-term].is-active) {
  opacity: 0.7;
}

.wc-layer--labels :deep([data-term]:focus-visible) {
  outline: none;
}

/* Static mode: let pointer events fall through to the pan/zoom wrapper. */
.wc-diagram-layers--static .wc-layer--labels :deep([data-term]),
.wc-diagram-layers--static .wc-layer--labels :deep([data-term] text),
.wc-diagram-layers--static .wc-layer--labels :deep([data-term] tspan) {
  pointer-events: none;
}
</style>
