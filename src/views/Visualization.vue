<template>
  <div id="visualization">
    <WaterCyle/>
  </div>
</template>

<script>

export default {
    name: 'Visualization',
    components: {
      WaterCyle: () => import( /* webpackPreload: true */ /*webpackChunkName: "section"*/ "./../components/WaterCycle")
    },
    computed: {
    },
    mounted(){
      
    },
    methods:{
    }
} 
</script>

<style lang="scss">

</style>
