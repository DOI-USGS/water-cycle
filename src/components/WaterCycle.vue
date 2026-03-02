<template>
  <div id="content-container">
    <h1
      class="diagram-title"
      :lang="inEnglish ? 'en' : 'es'"
    >
      {{ activeLongDescription.title }}
    </h1>
    <nav
      id="button-container"
      aria-label="Diagram controls"
    >
      <ul class="control-list">
        <li class="control-item">
          <a
            href="https://www.usgs.gov/special-topics/water-science-school/science/water-cycle"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit the Water Science School
            <span class="only">opens in new tab</span>
          </a>
        </li>
        <li class="control-item">
          <a
            href="https://labs.waterdata.usgs.gov/visualizations/pools-and-fluxes/index.html#/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Explore the size of pools and fluxes
            <span class="only">opens in new tab</span>
          </a>
        </li>
        <li class="control-item">
          <a
            :href="downloadSite"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ currentLanguageDownloadText }}
            <span class="only">
              {{ inEnglish ? 'opens in new tab' : 'se abre en una nueva pestana' }}
            </span>
          </a>
        </li>
        <li class="control-item">
          <span class="control-label">Language:</span>
          <button
            class="button"
            @click="toggleLanguage"
          >
            {{ currentLanguageStatus }}
          </button>
        </li>
        <li class="control-item">
          <span class="control-label">Zoom:</span>
          <button
            class="zoom button"
            aria-label="Zoom in"
            @click="zoom.value = Math.min(zoom.value + 0.1, 5)"
          >
            +
          </button>
          <button
            class="zoom button out"
            aria-label="Zoom out"
            @click="zoom.value = Math.max(zoom.value - 0.1, 1)"
          >
            -
          </button>
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
          <details class="long-description">
            <summary class="button long-description-toggle">
              {{ activeLongDescription.summaryLabel }}
            </summary>
            <div
              class="long-description-content"
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
            </div>
          </details>
        </li>
      </ul>
    </nav>
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


const loadEnglish = ref(true)
const loadSpanish = ref(false)
const inEnglish = ref(true)
const currentLanguageStatus = ref(null)
const imageSrcEnglish = ref(null)
const imageSrcWebpEnglish = ref(null)
const imageSrcSpanish = ref(null)
const imageSrcWebpSpanish = ref(null)
const downloadSite = ref(null)
const currentLanguageDownloadText = ref(null)
const englishLongDescription = diagramDescription.en
const spanishLongDescription = diagramDescription.es
const activeLongDescription = computed(() => (inEnglish.value ? englishLongDescription : spanishLongDescription))

onMounted(() => {
  downloadSite.value = 'https://d9-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/media/files/gip221_english.pdf'
  currentLanguageDownloadText.value = 'Download the diagram'
  currentLanguageStatus.value = 'cambiar a español'

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

// toggle language
function toggleLanguage() {
  inEnglish.value = !inEnglish.value

  if (inEnglish.value) {
    currentLanguageStatus.value = 'cambiar a español'
    currentLanguageDownloadText.value = 'Download the diagram'
    downloadSite.value = 'https://d9-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/media/files/gip221_english.pdf'
  } else {
    currentLanguageStatus.value = 'switch to English'
    currentLanguageDownloadText.value = 'Descargar el diagrama'
    downloadSite.value = 'https://d9-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/media/files/gip221_spanish.pdf'
  }
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
#button-container {
  padding-left: 0.25em;
}
.long-description {
  margin: 0;
}
.control-item:has(.long-description[open]) {
  align-items: flex-start;
  flex-basis: 100%;
  border-left: none;
  margin-left: 0;
  padding-left: 0;
}
.long-description-toggle {
  display: inline-block;
  list-style: none;
  cursor: pointer;
}
.long-description-toggle::marker {
  content: "";
}
.long-description-toggle::-webkit-details-marker {
  display: none;
}
.long-description-toggle::before {
  content: "▸";
  display: inline-block;
  margin-right: 0.4rem;
  transition: transform 0.15s ease-out;
}
.long-description[open] .long-description-toggle::before {
  transform: rotate(90deg);
}
.long-description-content {
  margin-top: 0.5rem;
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
.long-description-content p {
  margin-bottom: 0.5rem;
}
</style>
