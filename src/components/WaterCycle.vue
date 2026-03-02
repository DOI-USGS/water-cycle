<template>
  <div id="content-container">
    <div
      id="button-container"
    >
      <h3 class="optionsBar notButton">
        <a
          href="https://www.usgs.gov/special-topics/water-science-school/science/water-cycle"
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit the Water Science School
        </a>
      </h3>
      <h3 class="optionsBar notButton">
        |
      </h3>
      <h3 class="optionsBar notButton">
        <a
          href="https://labs.waterdata.usgs.gov/visualizations/pools-and-fluxes/index.html#/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Explore the size of pools and fluxes
        </a>
      </h3>
      <h3 class="optionsBar notButton">
        |
      </h3>
      <h3 class="optionsBar notButton">
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
      </h3>
      <h3 class="optionsBar notButton">
        |
      </h3>
      <h3 class="optionsBar">
        Language: 
        <button
          class="button"
          @click="toggleLanguage"
        >
          {{ currentLanguageStatus }}
        </button>
      </h3>
      <h3 class="optionsBar notButton">
        |
      </h3>
      <h3 class="optionsBar">
        Zoom:
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
      </h3>
      <h3 class="optionsBar notButton">
        |
      </h3>
      <ExpandingSidebar class="optionsBar">
        <template #sidebarTitle>
          Contributors
        </template>
        <template #sidebarMessage>
          <AuthorshipSection class="hidden" />
        </template>
      </ExpandingSidebar>
      <h3 class="optionsBar notButton">
        |
      </h3>
      <details class="long-description optionsBar">
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
    </div>
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
            style="width: 100%; height: auto;"
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
            style="width: 100%; height: auto;"
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
$diagramBlue: #016699;
#content-container h3 {
  font-weight: 300;
}
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
.optionsBar {
  padding: 0.1em 0 0.1em 0;
  margin-left: 0.5rem;
}
#button-container {
  padding-left: 0.25em;
  display: flex;
  flex-wrap: wrap;
}
.button {
    border-radius: 0.25rem;
    margin-top: 5px;
    margin-bottom: 5px;
    padding: 2.5px 5px 2.5px 5px;
    max-width: 24rem;
    background-color: white;
    border: 0.5px solid #949494;
    border-radius: 0.25rem;
    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */
    @media screen and (max-width: 600px) {
      border: 1px solid #949494;
    }
  }
  .button:hover {
    background-color: $diagramBlue;
    color: white;
    @media screen and (max-width: 600px) {
      background-color: white;
      color: black;
    }
  }
  .button.zoom {
    padding: 2.5px 10px 2.5px 10px;
  }
  .button.zoom.out {
    margin-left: 0.5rem;
  }
  .notButton {
    margin-top: 7.5px;
    margin-bottom: 5px;
  }
  .long-description {
    margin-left: 0.5rem;
    align-self: center;
  }
  .long-description[open] {
    flex-basis: 100%;
    align-self: stretch;
    margin-right: 0.5rem;
  }
  .long-description-toggle {
    display: inline-block;
    list-style: none;
    cursor: pointer;
    font-family: var(--style-font);
    font-size: 1.3em;
    font-weight: 300;
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
  @media screen and (max-height: 770px) {
    .long-description-toggle {
      font-size: 1.2em;
    }
  }
  @media screen and (max-width: 700px) {
    .long-description-toggle {
      font-size: 0.9em;
    }
  }
  @media screen and (max-height: 500px) {
    .long-description-toggle {
      font-size: 0.9em;
    }
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
  a {
    color: $diagramBlue;
  }
  a:hover {
    font-weight: 700;
  }
</style>
