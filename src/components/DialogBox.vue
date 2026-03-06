<template>
  <section
    :id="id"
    ref="dialogElement"
    class="info-overlay-panel"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="titleId"
    :lang="lang"
    tabindex="-1"
    @wheel.stop
  >
    <header>
      <h3 :id="titleId">
        {{ title }}
      </h3>
      <button
        class="button control-action"
        :aria-label="closeLabel"
        @click="emit('close')"
      >
        {{ closeText }}
      </button>
    </header>
    <div class="dialog-content">
      <slot />
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  id: {
    type: String,
    required: true
  },
  titleId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  lang: {
    type: String,
    required: true
  },
  closeLabel: {
    type: String,
    required: true
  },
  closeText: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close'])
const dialogElement = ref(null)

defineExpose({
  dialogElement
})
</script>

<style scoped lang="scss">
.info-overlay-panel {
  box-sizing: border-box;
  width: min(80rem, 100%, calc(100vw - 3rem));
  max-height: min(100%, calc(100vh - 3rem));
  overflow: auto;
  overscroll-behavior: contain;
  background: #ffffff;
  border: 1px solid #949494;
  border-radius: 0.4rem;
}

.info-overlay-panel > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #d8d8d8;
}

.info-overlay-panel > header h3 {
  margin: 0;
  padding: 0;
  font-family: var(--style-font);
  font-size: 1.1em;
  font-weight: 600;
}

.dialog-content {
  padding: 0.5rem 1rem 1rem 1rem;
}

.dialog-content :deep(section) {
  margin-bottom: 1rem;
}

.dialog-content :deep(h4) {
  font-size: 1.1em;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.dialog-content :deep(p) {
  margin-bottom: 0.5rem;
}
</style>
