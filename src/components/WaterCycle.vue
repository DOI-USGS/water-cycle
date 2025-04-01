<template>
  <div id="content-container">
    <div
      id="button-container"
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
      <h3 class="optionsBar notButton">
        <a
          :href="downloadSite"
          target="_blank"
        >
          {{ currentLanguageDownloadText }}
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
        <picture v-if="loadEnglish" v-show="inEnglish">
          <source :srcset="imageSrcWebpEnglish" type="image/webp" />
          <source :srcset="imageSrcEnglish" type="image/png" />
          <img
            id="diagramEnglish"
            :src="imageSrcWebpEnglish"
            @load="onImageLoad"
            style="width: 100%; height: auto;"
          />
        </picture>

        <picture v-if="loadSpanish" v-show="!inEnglish">
          <source :srcset="imageSrcWebpSpanish" type="image/webp" />
          <source :srcset="imageSrcSpanish" type="image/png" />
          <img
            id="diagramSpanish"
            :src="imageSrcWebpSpanish"
            @load="onImageLoad"
            style="width: 100%; height: auto;"
          />
        </picture>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Sidebar from './../components/Sidebar.vue'

// zooom logic
const zoom = ref(1)
const zoomContainer = ref(null)
const imageWrapper = ref(null)
const imageAspectRatio = ref(1)
const transformOrigin = ref('center center')

const zoomStyle = computed(() => ({
  transform: `scale(${zoom.value})`,
  transformOrigin: transformOrigin.value,
  transition: 'transform 0.1s ease-out'
}))

// center zoom on cursor
const handleWheel = (e) => {
  const rect = e.currentTarget.getBoundingClientRect()
  const offsetX = e.clientX - rect.left
  const offsetY = e.clientY - rect.top

  const percentX = (offsetX / rect.width) * 100
  const percentY = (offsetY / rect.height) * 100

  transformOrigin.value = `${percentX}% ${percentY}%`

  const delta = e.deltaY > 0 ? -0.1 : 0.1
  zoom.value = Math.min(Math.max(zoom.value + delta, 1), 5)

  // reset zoom center when at 1
  if (zoom.value === 1) {
  transformOrigin.value = 'center center'
}

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