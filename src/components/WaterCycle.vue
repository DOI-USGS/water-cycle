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
      :description-panel-id="descriptionPanelId"
      :is-description-open="isDescriptionOpen"
      :description-summary-label="activeLongDescription.summaryLabel"
      @zoom-in="zoomIn"
      @zoom-out="zoomOut"
      @set-language="setLanguage"
      @toggle-description="toggleDescription"
    />
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
    <RelatedResources :in-english="inEnglish" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DiagramControls from './DiagramControls.vue'
import RelatedResources from './RelatedResources.vue'
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
