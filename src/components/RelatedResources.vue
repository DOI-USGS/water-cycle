<template>
  <section
    id="related-resources"
    :aria-labelledby="relatedResourcesHeadingId"
    :lang="inEnglish ? 'en' : 'es'"
  >
    <h2
      :id="relatedResourcesHeadingId"
      class="only"
    >
      {{ relatedResourcesHeading }}
    </h2>
    <ul class="control-list no-separators">
      <li class="control-item">
        <span class="control-prefix">{{ relatedResourcesHeading }}:</span>
      </li>
      <li class="control-item">
        <a
          class="button control-action"
          href="https://www.usgs.gov/special-topics/water-science-school/science/water-cycle"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ waterScienceSchoolLabel }}
          <span class="only">{{ opensInNewTabText }}</span>
        </a>
      </li>
      <li class="control-item">
        <a
          class="button control-action"
          href="https://labs.waterdata.usgs.gov/visualizations/pools-and-fluxes/index.html#/"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ poolsAndFluxesLabel }}
          <span class="only">{{ opensInNewTabText }}</span>
        </a>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  inEnglish: {
    type: Boolean,
    required: true
  }
})

const relatedResourcesHeadingId = 'related-resources-heading'
const relatedResourcesHeading = computed(() => (props.inEnglish ? 'Related resources' : 'Recursos relacionados'))
const waterScienceSchoolLabel = computed(() => (props.inEnglish ? 'USGS Water Science School' : 'La Escuela de Ciencias del Agua'))
const poolsAndFluxesLabel = computed(() => (props.inEnglish ? 'Pools and fluxes visualization' : 'Los reservorios y flujos'))
const opensInNewTabText = computed(() => (props.inEnglish ? 'opens in new tab' : 'se abre en una nueva pestana'))
</script>

<style scoped lang="scss">
#related-resources {
  padding: 0 1.5rem 0.5rem;
  margin-top: 0.35rem;
}

#related-resources .button {
  max-width: none;
}
</style>
