<template>
  <div id="app" class="box">
    <!-- <WindowSize v-if="checkTypeOfEnv === '-test build-'" /> -->
    <HeaderUSGS />
    <InternetExplorerPage v-if="isInternetExplorer" />
    <!-- an empty string in this case means the 'prod' version of the application   -->
    <router-view
      v-if="!isInternetExplorer"
    />
    <FooterUSGS />
  </div>
</template>

<script>
    // import WindowSize from "./components/WindowSize";
    import HeaderUSGS from './components/HeaderUSGS';
    import { isMobile } from 'mobile-device-detect';
    export default {
        name: 'App',
        components: {
            // WindowSize,
            HeaderUSGS,
            InternetExplorerPage: () => import( /* webpackPrefetch: true */ /*webpackChunkName: "internet-explorer-page"*/ "./components/InternetExplorerPage"),
            //WorkInProgressWarning: () => import( /* webpackPrefetch: true */ /*webpackChunkName: "work-in-progress-warning"*/ "./components/WorkInProgressWarning"),
            // PreFooterCodeLinks: () => import( /* webpackPrefetch: true */ /*webpackChunkName: "pre-footer-links-code"*/ "./components/PreFooterCodeLinks"),
            FooterUSGS: () => import( /* webpackPrefetch: true */ /*webpackChunkName: "usgs-footer"*/ "./components/FooterUSGS") // Have Webpack put the footer in a separate chunk so we can load it conditionally (with a v-if) if we desire
        },
        data() {
            return {
                isInternetExplorer: false,
                title: process.env.VUE_APP_TITLE,
                publicPath: process.env.BASE_URL, // this is need for the data files in the public folder
                mobileView: isMobile
            }
        },
        computed: {
          checkTypeOfEnv() {
              return process.env.VUE_APP_TIER
          }
        },
        created() {
            // We are ending support for Internet Explorer, so let's test to see if the browser used is IE.
            this.$browserDetect.isIE ? this.isInternetExplorer = true : this.isInternetExplorer = false;
            // Add window size tracking by adding a listener and a way to store the values in the Vuex state
            window.addEventListener('resize', this.handleResize);
            this.handleResize();
        },
        destroyed() {
            window.removeEventListener('resize', this.handleResize);
        },
        methods:{
          handleResize() {
                this.$store.commit('recordWindowWidth', window.innerWidth);
                this.$store.commit('recordWindowHeight', window.innerHeight);
            },
        }
    }
</script>

<style lang="scss">
// Fonts
@import url('https://fonts.googleapis.com/css2?family=Assistant:wght@200;300;400;500;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Abel&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap');
$Abel: 'Abel', sans-serif;
$Assistant: 'Assistant', sans-serif;


// Type
html,
body {
      height:100%;
      background-color: white;
      margin: 0;
      padding: 0;
      line-height: 1.2;
      font-size: 16px;
      font-weight: 400;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      width: 100%;
      @media screen and (max-width: 600px) {
        font-size: 16px;
      }
  }
.box {
  display: flex;
  flex-flow: column;
  height: 100%;
}
.box .row.header {
  flex: 0 1 81px;
  margin: 0;
}
.box .row.buttonContainer {
  flex: 0 1 50px;
  margin: 0;
  margin-bottom: 5px;
}
.box .row.content {
  flex: 1 1 auto;
  margin: 0;
}
.box .row.footer {
  flex: 0 1 25px;
  margin: 0;
}

h1{
  font-size: 3.5em;
  font-weight: 300;
  font-family: $Abel;
  line-height: 1;
  text-align: left;
  text-shadow: 1px 1px 100px rgba(0,0,0,.8);
  @media screen and (max-width: 600px) {
    font-size: 2.5em;
  }
}
h2{
  font-weight: 300;
  text-align: left;
  font-family:$Assistant;
  font-size: 1.3em;
  margin-top: 5px;
  line-height: 1.2;
  @media screen and (max-width: 600px) {
    font-size: 2em;
  }
}
h3{
  font-size: 1.3em;
  font-family: $Assistant;
  font-weight: 300;
  @media screen and (max-height: 770px) {
    font-size: 1.2em;
  }
  @media screen and (max-width: 700px) {
      font-size: 0.9em;
  } 
  @media screen and (max-height: 500px) {
      font-size: 0.9em;
  } 
}
p, text {
  font-family: $Assistant;
  font-size: 1em;
  line-height: 0.8em;
}
a { 
  color: black;
}

</style>
