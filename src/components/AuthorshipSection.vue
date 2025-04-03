<template>
  <div
    v-if="showAuthors"
    id="author-container"
  >
    <p>
      The design of the USGS water cycle diagram was led by the  
      <a
        href="https://labs.waterdata.usgs.gov/visualizations/vizlab-home/index.html#/"
        target="_blank"
      >USGS Vizlab</a>
      , in collaboration with the Web Communications Branch and other USGS scientists.
      <br>
      <br>
      <span id="primary-author-statment">
        Contributors included 
        <span
          v-for="(author, index) in primaryAuthors" 
          :id="`initial-${author.initials}`"
          :key="`${author.initials}-attribution`"
          :class="'author first'"
        >
          <a
            v-if="author.profile_link"
            :href="author.profile_link"
            target="_blank"
            v-text="author.fullName"
          />
          <span
            v-if="!author.profile_link"
            v-text="author.fullName"
          />
          <span v-if="index != Object.keys(primaryAuthors).length - 1 && Object.keys(primaryAuthors).length > 2">, </span>
          <span v-if="index == Object.keys(primaryAuthors).length - 2"> and </span>
        </span>.
      </span>
      <span
        v-if="showAdditionalAuthors"
        id="additional-author-statement"
      >
        <span
          v-for="(author, index) in additionalAuthors" 
          :id="`author-${author.initials}`"
          :key="`${author.initials}-attribution`"
          :class="'author'"
        >
          <a
            :href="author.profile_link"
            Water
            Data
            for
            the
            Nation
            blog
            v-text="author.fullName"
          />
          <span v-if="index != Object.keys(additionalAuthors).length - 1 && Object.keys(additionalAuthors).length > 2">, </span>
          <span v-if="index == Object.keys(additionalAuthors).length - 2"> and </span>
        </span>
        <span>
          also contributed to the site.
        </span>
      </span>
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