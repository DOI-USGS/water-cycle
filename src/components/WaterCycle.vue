<template>
  <div id="content-container">
    <h1
      class="diagram-title"
      :lang="inEnglish ? 'en' : 'es'"
    >
      {{ activeLongDescription.title }}
    </h1>
    <nav
      id="quick-controls"
      :aria-label="quickControlsNavLabel"
    >
      <ul class="control-list no-separators">
        <li class="control-item control-action zoom-controls">
          <span>Zoom:</span>
          <button
            class="button control-action"
            :aria-label="zoomInLabel"
            @click="zoomIn"
          >
            +
          </button>
          <button
            class="button control-action"
            :aria-label="zoomOutLabel"
            @click="zoomOut"
          >
            -
          </button>
        </li>
        <li class="control-item">
          <span>Download:</span>
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
          <span>Language:</span>
          <label
            for="language-select"
            class="only"
          >
            {{ languageSelectLabel }}
          </label>
          <select
            id="language-select"
            v-model="selectedLanguage"
            class="button"
            :aria-label="languageSelectLabel"
            @change="setLanguage(selectedLanguage)"
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
          <span>More info:</span>
        </li>
        <li class="control-item">
          <ExpandingSidebar>
            <template #sidebarTitle>
              Contributors
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
            @click="toggleDescription"
          >
            {{ activeLongDescription.summaryLabel }}
          </button>
        </li>
      </ul>
    </nav>
    <section
      id="related-resources"
      :aria-labelledby="relatedResourcesHeadingId"
      :lang="inEnglish ? 'en' : 'es'"
    >
      <h2
        :id="relatedResourcesHeadingId"
        class="only"
      >
        {{ relatedResourcesHeading }}
      </h2>
      <ul class="control-list no-separators">
        <li class="control-item">
          <span>{{ relatedResourcesHeading }}:</span>
        </li>
        <li class="control-item">
          <a
            class="button control-action"
            href="https://www.usgs.gov/special-topics/water-science-school/science/water-cycle"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ waterScienceSchoolLabel }}
            <span class="only">{{ opensInNewTabText }}</span>
          </a>
        </li>
        <li class="control-item">
          <a
            class="button control-action"
            href="https://labs.waterdata.usgs.gov/visualizations/pools-and-fluxes/index.html#/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ poolsAndFluxesLabel }}
            <span class="only">{{ opensInNewTabText }}</span>
          </a>
        </li>
      </ul>
    </section>
    <section
      v-if="isDescriptionOpen"
      :id="descriptionPanelId"
      class="long-description-panel"
      :lang="inEnglish ? 'en' : 'es'"
    >
      <template v-if="activeLongDescription.sections.length > 0">
        <section
          v-for="(section, sectionIndex) in activeLongDescription.sections"
          :key="`long-description-section-${sectionIndex}`"
          class="long-description-section"
        >
          <h4 class="long-description-heading">
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
    </section>
    <div
      id="image-zoomer"
      ref="zoomContainer"
      class="content"
      @wheel.prevent="handleWheel"
    >
      <div
        ref="imageWrapper"
        :style="zoomStyle"
        class="image-wrapper"
      >
        <picture
          v-if="loadEnglish"
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
            @load="onImageLoad"
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
            @load="onImageLoad"
          >
        </picture>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ExpandingSidebar from './ExpandingSidebar.vue'
import AuthorshipSection from './AuthorshipSection.vue'
import diagramDescription from '@/assets/text/diagramDescription.json'

// zooom logic
const zoom = ref(1)
const zoomContainer = ref(null)
const imageWrapper = ref(null)
const imageAspectRatio = ref(1)

const zoomStyle = computed(() => ({
  transform: `scale(${zoom.value})`,
  transformOrigin: 'center center',
  transition: 'transform 0.1s ease-out'
}))

const MIN_ZOOM = 1
const MAX_ZOOM = 5
const ZOOM_STEP = 0.1

const handleWheel = (e) => {
  const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
  zoom.value = Math.min(Math.max(zoom.value + delta, MIN_ZOOM), MAX_ZOOM)
}

function zoomIn() {
  zoom.value = Math.min(zoom.value + ZOOM_STEP, MAX_ZOOM)
}

function zoomOut() {
  zoom.value = Math.max(zoom.value - ZOOM_STEP, MIN_ZOOM)
}


const loadEnglish = ref(true)
const loadSpanish = ref(false)
const inEnglish = ref(true)
const selectedLanguage = ref('en')
const imageSrcEnglish = ref(null)
const imageSrcWebpEnglish = ref(null)
const imageSrcSpanish = ref(null)
const imageSrcWebpSpanish = ref(null)
const downloadSite = ref(null)
const currentLanguageDownloadText = ref(null)
const englishLongDescription = diagramDescription.en
const spanishLongDescription = diagramDescription.es
const activeLongDescription = computed(() => (inEnglish.value ? englishLongDescription : spanishLongDescription))
const isDescriptionOpen = ref(false)
const descriptionPanelId = 'long-description-panel'
const quickControlsNavLabel = computed(() => (inEnglish.value ? 'Primary diagram controls' : 'Controles principales del diagrama'))
const relatedResourcesHeadingId = 'related-resources-heading'
const relatedResourcesHeading = computed(() => (inEnglish.value ? 'Related resources' : 'Recursos relacionados'))
const waterScienceSchoolLabel = computed(() => (inEnglish.value ? 'USGS Water Science School' : 'La Escuela de Ciencias del Agua'))
const poolsAndFluxesLabel = computed(() => (inEnglish.value ? 'Pools and fluxes visualization' : 'Los reservorios y flujos'))
const opensInNewTabText = computed(() => (inEnglish.value ? 'opens in new tab' : 'se abre en una nueva pestana'))
const languageSelectLabel = computed(() => (inEnglish.value ? 'Change language' : 'Cambiar idioma'))
const zoomInLabel = computed(() => (inEnglish.value ? 'Zoom in' : 'Acercar'))
const zoomOutLabel = computed(() => (inEnglish.value ? 'Zoom out' : 'Alejar'))
const downloadAriaLabel = computed(() => {
  if (inEnglish.value) {
    return 'Download the diagram, opens in new tab'
  }
  return 'Descargar el diagrama, se abre en una nueva pestana'
})

onMounted(() => {
  setLanguage('en')

  imageSrcEnglish.value = 'https://labs.waterdata.usgs.gov/visualizations/images/USGS_WaterCycle_English_ONLINE.png'
  imageSrcWebpEnglish.value = 'https://labs.waterdata.usgs.gov/visualizations/images/USGS_WaterCycle_English_ONLINE.webp'
  imageSrcSpanish.value = 'https://labs.waterdata.usgs.gov/visualizations/images/USGS_WaterCycle_Spanish_ONLINE.png'
  imageSrcWebpSpanish.value = 'https://labs.waterdata.usgs.gov/visualizations/images/USGS_WaterCycle_Spanish_ONLINE.webp'
})

// image load handler
function onImageLoad(e) {
  const img = e.target
  imageAspectRatio.value = img.naturalWidth / img.naturalHeight

  // load spanish diagram after english image is ready
  loadSpanish.value = true
}

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

function toggleDescription() {
  isDescriptionOpen.value = !isDescriptionOpen.value
}
</script>

<style scoped lang="scss">
#image-zoomer {
  height: 88vh;
  overflow: hidden;
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
#quick-controls {
  padding: 0 1.5rem;
  margin-top: 0.5rem;
}
#related-resources {
  padding: 0 1.5rem;
  margin-top: 0.35rem;
}
#related-resources .button {
  max-width: none;
}
.download-button {
  min-width: 2.4rem;
}
.download-button.icon-only {
  min-height: 3rem;
  padding-left: 0.7rem;
  padding-right: 0.7rem;
}
.long-description-panel {
  margin-top: 0.5rem;
  padding: 0 0.25rem 0.5rem 0.25rem;
  max-width: 70rem;
}
.long-description-section {
  margin-bottom: 1rem;
}
.long-description-heading {
  font-size: 1.1em;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.long-description-panel p {
  margin-bottom: 0.5rem;
}
</style>
