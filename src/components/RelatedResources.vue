<template>
  <section
    id="related-resources"
    aria-labelledby="related-resources-heading"
    :lang="inEnglish ? 'en' : 'es'"
  >
    <h2
      id="related-resources-heading"
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

const relatedResourcesHeading = computed(() => (props.inEnglish ? 'Related resources' : 'Recursos relacionados'))
const waterScienceSchoolLabel = computed(() => (props.inEnglish ? 'USGS Water Science School' : 'La Escuela de Ciencias del Agua'))
const poolsAndFluxesLabel = computed(() => (props.inEnglish ? 'Pools and fluxes visualization' : 'Los reservorios y flujos'))
const opensInNewTabText = computed(() => (props.inEnglish ? 'opens in new tab' : 'se abre en una nueva pestana'))
</script>
