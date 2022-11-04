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
      <h3 class="optionsBar notButton"> | </h3>
      <h3 class="optionsBar notButton">
        <a
          v-bind:href="downloadSite"
          target="_blank"
        >
          {{ currentLanguageDownloadText }}
        </a>
      </h3>
      <h3 class="optionsBar notButton"> | </h3>
      <h3 class="optionsBar">
        Language: 
        <button
          class="button"
          :text="currentLanguageStatus"
          @click="toggleLanguage"
        >
          {{ currentLanguageStatus }}
        </button>
      </h3>
      <h3 class="optionsBar notButton"> | </h3>
      <h3 class="optionsBar">
        Zoom:
        <button
          class="zoom button"
          @click="$refs.zoomer.zoomIn()"
        > + </button>
        <button
          class="zoom button out"
          @click="$refs.zoomer.zoomOut()"
        > - </button>
      </h3>
    </div>
    <v-zoomer
      id="image-zoomer"
      ref="zoomer"
      :aspect-ratio="imageAspectRatio"
      :max-scale="10"
      :zooming-elastic="false"
      class="content"
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
          :src="imageSrcWebpEnglish"
          id = "diagramEnglish"
          style="object-fit: contain; width: 100%; height: 100%; display: flex;"
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
          :src="imageSrcWebpSpanish"
          id = "diagramSpanish"
          style="object-fit: contain; width: 100%; height: 100%; display: flex;"
          @load="onImageLoad"
        >
      </picture>
    </v-zoomer>
  </div>
</template>

<script>
    export default {
        name: "WaterCyle",
        data () {
          return {
            zoomed: false,
            imageAspectRatio: 1,
            loadEnglish: true,
            loadSpanish: false,
            inEnglish: true,
            currentLanguageStatus: null,
            imageSrcEnglish: null,
            imageSrcWebpEnglish: null,
            imageSrcSpanish: null,
            imageSrcWebpSpanish: null,
            downloadSite: null,
            currentLanguageDownloadText: null,
          }
        },
        mounted () {
          this.downloadSite = "https://d9-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/media/files/USGS_WaterCycle_English_PRINT_20221013_508.pdf";
          this.currentLanguageDownloadText = "Download the diagram";
          this.currentLanguageStatus = 'cambiar a español';
          this.imageSrcEnglish = "https://labs.waterdata.usgs.gov/visualizations/images/USGS_WaterCycle_English_ONLINE.png";
          this.imageSrcWebpEnglish = "https://labs.waterdata.usgs.gov/visualizations/images/USGS_WaterCycle_English_ONLINE.png";
          this.imageSrcSpanish = "https://labs.waterdata.usgs.gov/visualizations/images/USGS_WaterCycle_Spanish_ONLINE.png";
          this.imageSrcWebpSpanish = "https://labs.waterdata.usgs.gov/visualizations/images/USGS_WaterCycle_Spanish_ONLINE.png";
        },
        methods: {
          onImageLoad(e) {
            const img = e.target
            this.imageAspectRatio = img.naturalWidth / img.naturalHeight
            console.log(img.id + " just loaded")

            // This function is first called on page load, **after** the English diagram is loaded
            // Now that the English version is loaded, we trigger the loading of the Spanish diagram 
            // by setting `loadSpanish` to `true`. `loadSpanish` sets the v-if on the picture element 
            // for the Spanish diagram.
            //
            // This function is also called after the Spanish image is loaded, in which case this
            // statement has no effect/ is redundant.
            this.loadSpanish = true;
          },
          toggleLanguage() {
            const self = this;

            // Update global value for whether diagram is shown in English
            this.inEnglish = !this.inEnglish;
            
            // Update button text and text of download link
            if (this.inEnglish) {
              this.currentLanguageStatus = 'cambiar a español'
              this.currentLanguageDownloadText = "Download the diagram";
            } else {
              this.currentLanguageStatus = 'switch to English'
              this.currentLanguageDownloadText = "Descargar el diagrama";
            }
          },
        },
    }
</script>

<style scoped lang="scss">
$diagramBlue: #016699;

#image-zoomer {
  height: 88vh;
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
.optionsBar {
  padding: 0.1em 0 0.1em 0;
  margin-left: 0.5rem;
}
#button-container {
  padding-left: 0.5vw;
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