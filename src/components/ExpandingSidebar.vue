<template>
  <div
    ref="sidebarRef"
    class="sidebar collapsed opacity"
  >
    <div class="sidebarContent">
      <div class="titleAndExit">
        <h3>
          <button
            class="button reveal"
            @click="toggle"
          >
            <slot name="sidebarTitle">
              Reveal
            </slot>
          </button>
        </h3>
        <div
          class="exit hidden"
          @click="toggle"
        >
          <h3>
            X
          </h3>
        </div>
      </div>
      <div class="messageArea">
        <div class="message">
          <slot name="sidebarMessage">
            Message
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref, nextTick } from 'vue'

const sidebarRef = ref(null)

const setDimensions = () => {
  const sidebar = sidebarRef.value
  if (!sidebar) return

  const buttonDiv = sidebar.querySelector('.titleAndExit')
  if (!buttonDiv) return

  const buttonDimensions = buttonDiv.getBoundingClientRect()
  sidebar.style.height = `${buttonDimensions.height}px`
  sidebar.style.width = `${buttonDimensions.width}px`
  sidebar.classList.remove('opacity')
}

const toggle = () => {
  const sidebar = sidebarRef.value
  if (!sidebar) return

  const exit = sidebar.querySelector('.exit')
  const sidebarButton = sidebar.querySelector('.reveal')

  if (exit && sidebarButton) {
    exit.classList.toggle('hidden')
    sidebarButton.classList.toggle('button')

    if (sidebar.classList.contains('expanded')) {
      sidebar.classList.remove('expanded')
      sidebar.classList.add('collapsed')
      setDimensions()
    } else {
      sidebar.classList.remove('collapsed')
      sidebar.classList.add('expanded')
      sidebar.style.width = 'auto'
      sidebar.style.height = 'auto'
    }
  }
}

onMounted(() => {
  window.addEventListener('load', () => {
    nextTick(() => {
      setDimensions()
    })
  })
})

</script>
<style lang="scss" scoped>
$diagramBlue: #016699;
.sidebar{
    display: flex;
    flex-direction: row;
    transition: width 2s, height 2s, transform 2s;
    will-change: width;
    border-radius: 5px;
    transition: opacity 0.3s;
}
.titleAndExit{
    position: relative;
}
.expanded {
  background: $diagramBlue;
  margin: 0 5px 0 0 ;
}
.expanded h3 {
  color: #fff;
  padding: 5px 10px;
}
.opacity{
  opacity: 0;
}
.exit{
    position: absolute;
    right: 5px;
    top: 0;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1em;
    padding: 5px;
    border-radius: 5px;
}
.exit h3 {
  border-radius: 5px;
  line-height: 0.8em;
  cursor: pointer;
    &:hover{
        font-weight: 700;
    }
}
.messageArea{
    padding:0 10px 10px 10px;
}
.message{
    background: #fff;
    padding: 10px;
    *{
      padding-top: 0;
      margin-bottom: 10px;
      &:last-child{
        margin-bottom: 0;
      }
    }
}
.collapsed{
    .message{
        width: 0;
        height: 0;
        opacity: 0;
    }
}
.hidden{
    display: none;
}
</style>
