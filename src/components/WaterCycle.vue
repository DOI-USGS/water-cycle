<template>
  <div id="content-container">
    <div id="button-container" class="box row buttonContainer">
        <h3>
            <span>
              Visit the <a href="https://www.usgs.gov/special-topics/water-science-school/science/water-cycle" target="_blank">USGS Water Science School</a>
            </span>
             | 
            <span>
              Zoom:
              <button @click="$refs.zoomer.zoomIn()" class="zoom button"> + </button>
              <button @click="$refs.zoomer.zoomOut()" class="zoom button"> - </button>
              | Language: 
              <button
                    class="button"
                    @click="toggleLanguage"
                    :text="currentLanguageStatus"
                  >
                    {{ currentLanguageStatus }}
              </button>
            </span> 
          </h3>
    </div>
    <v-zoomer
      ref="zoomer"
      :aspect-ratio="imageAspectRatio"
      :max-scale="10"
      :zooming-elastic="false"
      id = "image-zoomer"
      class="box row content"
    >
      <picture>
        <source v-bind:srcset="imageSrcWebp" type="image/webp">
        <source v-bind:srcset="imageSrc" type="image/png">
          <img v-bind:src="imageSrcWebp" style="object-fit: contain; width: 100%; height: 100%; display: flex;" @load="onImageLoad">
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
            inEnglish: true,
            currentLanguageStatus: null,
            imageSrc: null,
            imageSrcWebp: null
          }
        },
        mounted () {
          this.currentLanguageStatus = 'cambiar a español';
          this.imageSrc = "https://labs.waterdata.usgs.gov/visualizations/images/USGS_WaterCycle_English_ONLINE.png";
          this.imageSrcWebp = "https://labs.waterdata.usgs.gov/visualizations/images/USGS_WaterCycle_English_ONLINE.png";
        },
        methods: {
          onImageLoad(e) {
            const img = e.target
            this.imageAspectRatio = img.naturalWidth / img.naturalHeight
          },
          toggleLanguage() {
            const self = this;

            // Update global value for show Uncertainty
            this.inEnglish = !this.inEnglish;
            
            // Toggle on or off uncertainty bars
            if (this.inEnglish) {
              this.currentLanguageStatus = 'cambiar a español'
              this.imageSrc = "https://labs.waterdata.usgs.gov/visualizations/images/USGS_WaterCycle_English_ONLINE.png";
              this.imageSrcWebp = "https://labs.waterdata.usgs.gov/visualizations/images/USGS_WaterCycle_English_ONLINE.png";
              // this.$forceUpdate()
            } else {
              this.currentLanguageStatus = 'switch to English'
              this.imageSrc = "https://labs.waterdata.usgs.gov/visualizations/images/USGS_WaterCycle_Spanish_ONLINE.png";
              this.imageSrcWebp = "https://labs.waterdata.usgs.gov/visualizations/images/USGS_WaterCycle_Spanish_ONLINE.png";
              // this.$forceUpdate()
            }

            // Adjust y-axis label placement on mobile
            if (this.mobileView) {
              self.yAxis.selectAll("text")
                .transition()
                .duration(200)
                .attr("x", d => self.placeYAxisText(d, this.showUncertainty))
            }
          },
        },
    }
</script>

<style scoped lang="scss">
#image-zoomer {
  height: 88vh;
  @media screen and (max-height: 770px) {
    height: 80vh;
  }
  @media screen and (max-height: 700px) {
    height: 85vh;
  }
  @media screen and (max-height: 500px) {
    height: 80vh;
  }
}
#button-container {
  padding-left: 15px;
  height: 100%;
  z-index: 2;
  --tw-bg-opacity: 1;
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
    -khtml-user-select: none; /* Konqueror HTML */
      -moz-user-select: none; /* Old versions of Firefox */
      -ms-user-select: none; /* Internet Explorer/Edge */
          user-select: none; /* Non-prefixed version, currently
                                supported by Chrome, Edge, Opera and Firefox */
}
.button {
    border-radius: 0.25rem;
    margin-right: 2px;
    margin-top: 2px;
    padding: 2.5px 5px 2.5px 5px;
    max-width: 24rem;
    background-color: white;
    border: 0.5px solid #949494;
    border-radius: 0.25rem;
    margin-left: 0.5rem;
    margin-top: 0.5rem;
    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */
  }
  .button:hover {
    background-color: #6E6E6E;
    color: white;
    @media screen and (max-width: 600px) {
      background-color: white;
      color: black;
    }
  }
  .button.zoom {
    padding: 2.5px 10px 2.5px 10px;
  }
</style>