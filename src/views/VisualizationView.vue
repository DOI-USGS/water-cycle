<template>
  <div id="visualization">
    <WaterCycle />
  </div>
</template>

<script setup>
import WaterCycle from "@/components/WaterCycle.vue"

</script>

<style lang="scss">
@media screen and (max-width: 600px) {
  #visualization {
    display: flex;
    flex: 1 1 auto;
    min-height: 0;
  }
}
</style>
