<template>
  <div>
    <WindowSize v-if="typeOfEnv === '-test build-'" />
    <HeaderUSWDSBanner v-if="typeOfEnv !== '-test build-'" />
    <HeaderUSGS />
    <WorkInProgressWarning v-if="typeOfEnv !== ''" />
    <RouterView />
    <PreFooterCodeLinks />
    <FooterUSGS />
  </div>
</template>

<script setup>
  import { onMounted } from "vue";
  import { RouterView } from 'vue-router'
  import WindowSize from "@/components/WindowSize.vue";
  import HeaderUSWDSBanner from "@/components/HeaderUSWDSBanner.vue";
  import HeaderUSGS from '@/components/HeaderUSGS.vue';
  import WorkInProgressWarning from "@/components/WorkInProgressWarning.vue";
  import PreFooterCodeLinks from "@/components/PreFooterCodeLinks.vue";
  import FooterUSGS from '@/components/FooterUSGS.vue';
  import { useWindowSizeStore } from '@/stores/WindowSizeStore';

  const windowSizeStore = useWindowSizeStore();
  const typeOfEnv = import.meta.env.VITE_APP_TIER;

  // Declare behavior on mounted
  // functions called here
  onMounted(() => {
    // Add window size tracking by adding a listener
    window.addEventListener('resize', handleResize);
    handleResize();
  });

  // Functions
  function handleResize() {
    // store the window size values in the Pinia state
    windowSizeStore.windowWidth = window.innerWidth;
    windowSizeStore.windowHeight = window.innerHeight;
  }
</script>

<style lang="scss">

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

</style>
