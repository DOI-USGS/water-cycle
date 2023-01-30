<template>
  <div id="author-container" v-if="showAuthors">
    <p>
      The design of the Water Cycle Diagram was led by the USGS 
      <a href="https://labs.waterdata.usgs.gov/visualizations/vizlab-home/index.html#/" target="_blank">Vizlab</a>
      , in colaboration with the Web Communications Branch and other USGS scientists.
      <br>
      <br>
      <span id="contribution-statements" v-if="showContributionStatements">
        Vizlab is a data visualization team in the Data Science Branch of the USGS Water Resources Mission Area that brings expertise in communicating complex data-driven topics through compelling visuals.
        <span id="primary-author-contribution">
          <span
            v-for="author in primaryAuthors" 
            :key="`${author.initials}-contribution`"
            :id="`author-${author.initials}`"
            :class="'author'"
          >
            <a v-bind:href="author.profile_link" target="_blank" v-text="author.fullName"></a> <span v-text="author.contribution"></span>. 
          </span>
        </span>
        <br>
        <br>
        The Web Communications Branch of the USGS Water Resources Mission Area provided expertise in user-centered design, communications, outreach, and educational engagement.
        <span id="additional-author-contribution"  v-if="showAditionalContributionStatement">
          <span
            v-for="author in additionalAuthors" 
            :key="`${author.initials}-contribution`"
            :id="`author-${author.initials}`"
            :class="'author'"
          >
            <a v-bind:href="author.profile_link" target="_blank" v-text="author.fullName"></a> <span v-text="author.contribution"></span>. 
          </span>
        </span>
      </span>
    </p>
  </div>
</template>

<script>
import { isMobile } from 'mobile-device-detect';
import authors from "@/assets/text/authors";
export default {
  name: "authorship",
    components: {
    },
    props: {
    },
    data() {
      return {
        publicPath: process.env.BASE_URL, // allows the application to find the files when on different deployment roots
        appTitle: process.env.VUE_APP_TITLE, // Pull in title of page from Vue environment (set in .env)
        mobileView: isMobile, // test for mobile
        primaryAuthors: authors.primaryAuthors,
        additionalAuthors: authors.additionalAuthors,
        showAuthors: null, // Turn on or off attribution for all authors
        showAdditionalAuthors: null, // If showAuthors is true, turn on or off attribution for additional authors
        showContributionStatements: true, // If showAuthors is true, turn on or off contribution statements for ALL authors
        showAditionalContributionStatement: null // If showAuthors is true and if showContributionStatements is true, turn on or off contriubtion statements for ADDITIONAL authors
      }
    },
    mounted(){   
      console.log(this.appTitle)
      this.showAuthors = this.primaryAuthors.length > 0 ? true: false; // Show author statements for any authors
      this.showAdditionalAuthors =  this.additionalAuthors.length > 0 ? true : false; // Show author statements for additional authors if any are listed
      this.showAditionalContributionStatement = this.additionalAuthors.length > 0 ? true : false; // Show contributions statements for additional authors if any are listed AND showContributionStatements is true
    },
    methods:{
      isMobile() {
              if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                  return true
              } else {
                  return false
              }
          }
    }
}
</script>
<style>
#author-container {
  height: auto;
  padding: 0em 0.25em 0em 0.25em;
  margin: 1rem 0.5rem 1rem 0.5rem;
}
</style>