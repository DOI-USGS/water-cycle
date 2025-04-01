<template>
  <div id="content-container">
    <div
      id="button-container"
      v-if="currentLang"
    >
      <h3 class="optionsBar notButton">
        <a
          href="https://www.usgs.gov/special-topics/water-science-school/science/water-cycle"
          target="_blank"
        >Visit the Water Science School</a>
      </h3>
      <h3 class="optionsBar notButton">
        |
      </h3>
      <h3 class="optionsBar notButton">
        <a
          href="https://labs.waterdata.usgs.gov/visualizations/pools-and-fluxes/index.html#/"
          target="_blank"
        >Explore the size of pools and fluxes</a>
      </h3>
      <h3 class="optionsBar notButton">
        |
      </h3>
      <h3 class="optionsBar notButton" v-if="currentLang" >
        <a :href="currentLang.downloadLink" target="_blank">
          {{ currentLang.downloadText }}
        </a>
      </h3>
      <h3 class="optionsBar notButton">
        |
      </h3>
      <h3 class="optionsBar">
        Language: 
        <button class="button" @click="toggleLanguage">
          {{ currentLang.toggleText }}
        </button>

      </h3>
      <h3 class="optionsBar notButton">
        |
      </h3>
      <h3 class="optionsBar">
        Zoom:
        <button class="zoom button" @click="zoom.value = Math.min(zoom.value + 0.1, 5)">+</button>
        <button class="zoom button out" @click="zoom.value = Math.max(zoom.value - 0.1, 1)">-</button>
      </h3>
      <h3 class="optionsBar notButton">
        |
      </h3>
      <Sidebar class="optionsBar" />
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
      <picture v-if="currentLang">
        <source :srcset="currentLang.imageWebp" type="image/webp" />
        <source :srcset="currentLang.imagePng" type="image/png" />
        <img
          :src="currentLang.imageWebp"
          :alt="currentLang.name + ' water cycle diagram'"
          @load="onImageLoad"
          style="width: 100%; height: auto;"
          draggable="false"
        />
      </picture>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Sidebar from './../components/Sidebar.vue'

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

// handling languages
const availableLanguages = [
  {
    code: 'en',
    name: 'English',
    label: 'English', // for the translated name
    downloadText: 'Download the diagram',
    downloadLink: 'https://d9-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/media/files/gip221_english.pdf',
    imagePng: 'https://labs.waterdata.usgs.gov/visualizations/images/USGS_WaterCycle_English_ONLINE.png',
    imageWebp: 'https://labs.waterdata.usgs.gov/visualizations/images/USGS_WaterCycle_English_ONLINE.webp',
  },
  {
    code: 'es',
    name: 'Español',
    label: 'Español',
    downloadText: 'Descargar el diagrama',
    downloadLink: 'https://d9-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/media/files/gip221_spanish.pdf',
    imagePng: 'https://labs.waterdata.usgs.gov/visualizations/images/USGS_WaterCycle_Spanish_ONLINE.png',
    imageWebp: 'https://labs.waterdata.usgs.gov/visualizations/images/USGS_WaterCycle_Spanish_ONLINE.webp',
  },
  {
    code: 'fr',
    name: 'French',
    label: 'Français',
    downloadText: 'Télécharger le diagramme',
    downloadLink: 'https://d9-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/media/files/USGS_WaterCycle_Poster_French_2.pdf',
    imagePng: 'https://d9-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/media/images/USGS_WaterCycle_Online_French_2.png',
    imageWebp: 'https://d9-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/media/images/USGS_WaterCycle_Online_French_2.png',
  }
]

const currentLangIndex = ref(0)
const currentLang = computed(() => availableLanguages[currentLangIndex.value])

// image load handler
function onImageLoad(e) {
  const img = e.target
  imageAspectRatio.value = img.naturalWidth / img.naturalHeight
}


// toggle language
function toggleLanguage() {
  currentLangIndex.value = (currentLangIndex.value + 1) % availableLanguages.length
}

</script>

<style scoped lang="scss">
$diagramBlue: #016699;

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
  a {
    color: $diagramBlue;
  }
  a:hover {
    font-weight: 700;
  }
</style>