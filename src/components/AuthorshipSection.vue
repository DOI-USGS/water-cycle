<template>
  <div
    v-if="showAuthors"
    id="author-container"
  >
    <p>
      The design of the USGS water cycle diagram was done by the  
      <a
        href="https://labs.waterdata.usgs.gov/visualizations/vizlab-home/index.html#/"
        target="_blank"
      >USGS Vizlab</a>, in collaboration with the USGS Water Mission Area Web Communications Branch and subject matter expertise from USGS scientists.
      <br>
      <br>
      Cite as: Corson-Dosch, H., Nell, C., Volentine, R., Archer, A., Bechtel, E., Bruce, J., Felts, N., Gross, T., Lopez-Trujilio, D., Riggs, C., and Read, E. October 13, 2022. The Water Cycle. U.S. Geological Survey General Information Product 221.
      <br>
      <br>
      To learn more about the team and the design process, read the Water Data for the Nation blog post 
      <a
        class="blog_title"
        href="https://waterdata.usgs.gov/blog/water-cycle-release/"
        target="_blank"
      >A New Take on the Water Cycle</a>
      .
      <span
        v-if="showContributionStatements"
        id="contribution-statements"
      >
        <span id="primary-author-contribution">
          <span
            v-for="author in primaryAuthors" 
            :id="`author-${author.initials}`"
            :key="`${author.initials}-contribution`"
            :class="'author'"
          >
            <a
              :href="author.profile_link"
              target="_blank"
              v-text="author.fullName"
            /> <span v-text="author.contribution" />. 
          </span>
        </span>
        <span
          v-if="showAditionalContributionStatement"
          id="additional-author-contribution"
        >
          <span
            v-for="author in additionalAuthors" 
            :id="`author-${author.initials}`"
            :key="`${author.initials}-contribution`"
            :class="'author'"
          >
            <a
              :href="author.profile_link"
              target="_blank"
              v-text="author.fullName"
            /> <span v-text="author.contribution" />. 
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
  name: "AuthorshipSection",
    components: {
    },
    props: {
    },
    data() {
      return {
        publicPath: import.meta.env.BASE_URL, // allows the application to find the files when on different deployment roots
        mobileView: isMobile, // test for mobile
        primaryAuthors: authors.primaryAuthors,
        additionalAuthors: authors.additionalAuthors,
        showAuthors: null, // Turn on or off attribution for all authors
        showAdditionalAuthors: null, // If showAuthors is true, turn on or off attribution for additional authors
        showContributionStatements: false, // If showAuthors is true, turn on or off contribution statements for ALL authors
        showAditionalContributionStatement: null // If showAuthors is true and if showContributionStatements is true, turn on or off contriubtion statements for ADDITIONAL authors
      }
    },
    mounted(){   
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
<style lang="scss" scoped>
$diagramBlue: #016699;
#author-container {
  height: auto;
  padding: 0em 0.25em 0em 0.25em;
  margin: 1rem 0.5rem 1rem 0.5rem;
}
a[href] {
  color: $diagramBlue;
}
a[href]:hover {
  font-weight: 700;
}
.blog_title {
  font-style: italic;
}
</style>