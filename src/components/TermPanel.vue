<template>
  <aside
    id="term-panel"
    class="term-panel"
    :class="{ 'term-panel--empty': !term }"
    :lang="lang"
    aria-live="polite"
  >
    <template v-if="term">
      <header class="term-panel__header">
        <h2
          :id="titleId"
          class="term-panel__title"
        >
          <span class="term-panel__label">{{ term.label }}</span>
          <span
            v-if="term.qualifier"
            class="term-panel__qualifier"
          >{{ term.qualifier }}</span>
        </h2>
        <button
          type="button"
          class="term-panel__close"
          :aria-label="closeLabel"
          :title="closeLabel"
          @click="emit('close')"
        >
          <FontAwesomeIcon
            :icon="['fas', 'xmark']"
            aria-hidden="true"
          />
        </button>
      </header>
      <div class="term-panel__body">
        <p class="term-panel__definition">
          {{ term.definition }}
        </p>
      </div>
    </template>

    <!-- Resting state: prompt the user to click a label. -->
    <p
      v-else
      class="term-panel__hint"
    >
      {{ hintText }}
    </p>
  </aside>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // The selected term, or null when nothing is selected.
  // Shape: { id, title, label, qualifier, definition }
  term: {
    type: Object,
    default: null
  },
  // Active language ('en' | 'es'); drives the static UI strings and the lang
  // attribute on the panel.
  language: {
    type: String,
    default: 'en'
  }
})

const emit = defineEmits(['close'])

const lang = computed(() => (props.language === 'es' ? 'es' : 'en'))
const inEnglish = computed(() => props.language !== 'es')

const titleId = 'term-panel-title'
const closeLabel = computed(() => (inEnglish.value ? 'Close panel' : 'Cerrar panel'))
const hintText = computed(() => (
  inEnglish.value
    ? 'Select a label on the diagram to learn more about that part of the water cycle.'
    : 'Seleccione una etiqueta en el diagrama para obtener mas informacion sobre esa parte del ciclo del agua.'
))
</script>

<style scoped lang="scss">
.term-panel {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid #949494;
  border-radius: 0.4rem;
  overflow: hidden;
}

.term-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #d8d8d8;
}

.term-panel__title {
  margin: 0;
  padding: 0;
  /* Global base.css h2 rule jumps to font-size:2em below 600px, which the
     label/qualifier spans then multiply. Pin an explicit rem-based size here
     (root is 62.5%, so 1rem = 10px) so the panel header stays controlled and
     independent of the inherited/body font-size. */
  font-size: 1.6rem;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.35rem;
  line-height: 1.2;
}

.term-panel__label {
  font-size: 1.2em;
  font-weight: 700;
}

.term-panel__qualifier {
  font-size: 1em;
  font-weight: 400;
  color: #4a4a4a;
}

.term-panel__close {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  font-size: 1.1rem;
  line-height: 1;
  color: #00264c;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  cursor: pointer;
}

.term-panel__close:hover {
  background: #eef2f6;
}

.term-panel__close:focus-visible {
  outline: 2px solid #00264c;
  outline-offset: 1px;
}

.term-panel__body {
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
  padding: 0.75rem 1rem 1rem 1rem;
}

.term-panel__definition {
  margin: 0;
  line-height: 1.45;
}

.term-panel__hint {
  margin: 0;
  padding: 1rem;
  color: #4a4a4a;
  font-style: italic;
  line-height: 1.45;
}

@media screen and (max-width: 600px) {
  .term-panel__title {
    font-size: 1.4rem;
  }
}
</style>
