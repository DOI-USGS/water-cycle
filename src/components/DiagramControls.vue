<template>
  <section
    id="quick-controls"
    aria-labelledby="quick-controls-heading"
  >
    <h2
      id="quick-controls-heading"
      class="only"
    >
      {{ quickControlsSectionLabel }}
    </h2>
    <ul
      class="control-list no-separators"
      role="toolbar"
      aria-labelledby="quick-controls-heading"
    >
      <li class="control-item">
        <span class="control-prefix">{{ zoomLabel }}</span>
        <button
          class="button control-action control-small"
          :aria-label="zoomInLabel"
          @click="emit('zoom-in')"
        >
          +
        </button>
        <button
          class="button control-action control-small"
          :aria-label="zoomOutLabel"
          @click="emit('zoom-out')"
        >
          -
        </button>
      </li>
      <li class="control-item">
        <label
          for="language-select"
          class="control-prefix"
        >
          {{ languageLabel }}
        </label>
        <select
          id="language-select"
          v-model="languageValue"
          class="button"
        >
          <option
            value="en"
            lang="en"
          >
            English
          </option>
          <option
            value="es"
            lang="es"
          >
            Espanol
          </option>
        </select>
      </li>
      <!-- Interactivity and Version are English-only for now: Spanish term
           definitions are not written yet, so these controls are removed
           when Spanish is selected. -->
      <li
        v-if="inEnglish"
        class="control-item"
      >
        <span
          id="interactivity-label"
          class="control-prefix"
        >Interactive:</span>
        <button
          type="button"
          class="interactivity-switch"
          role="switch"
          aria-labelledby="interactivity-label"
          :aria-checked="isInteractive ? 'true' : 'false'"
          @click="emit('set-interactive', !isInteractive)"
        >
          <span
            class="switch-track"
            aria-hidden="true"
          >
            <span class="switch-thumb" />
          </span>
          <span aria-hidden="true">{{ isInteractive ? 'On' : 'Off' }}</span>
        </button>
      </li>
      <li
        v-if="inEnglish"
        class="control-item"
      >
        <label
          for="version-select"
          class="control-prefix"
        >
          Version:
        </label>
        <select
          id="version-select"
          v-model="levelValue"
          class="button"
        >
          <option value="beginner">
            Beginner
          </option>
          <option value="advanced">
            Advanced
          </option>
        </select>
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
  },
  selectedLanguage: {
    type: String,
    required: true
  },
  isInteractive: {
    type: Boolean,
    required: true
  },
  selectedLevel: {
    type: String,
    required: true
  }
})

// send state back to WaterCycle
const emit = defineEmits(['zoom-in', 'zoom-out', 'set-language', 'set-interactive', 'set-level'])

const languageValue = computed({
  get: () => props.selectedLanguage,
  set: (value) => {
    emit('set-language', value)
  }
})

const levelValue = computed({
  get: () => props.selectedLevel,
  set: (value) => {
    emit('set-level', value)
  }
})

const quickControlsSectionLabel = computed(() => (props.inEnglish ? 'Diagram controls' : 'Controles del diagrama'))
const zoomLabel = computed(() => (props.inEnglish ? 'Zoom:' : 'Acercar:'))
const languageLabel = computed(() => (props.inEnglish ? 'Language:' : 'Idioma:'))
const zoomInLabel = computed(() => (props.inEnglish ? 'Zoom in' : 'Acercar'))
const zoomOutLabel = computed(() => (props.inEnglish ? 'Zoom out' : 'Alejar'))
</script>

<style scoped lang="scss">
// Plain switch (no button box) so the track can be larger.
.interactivity-switch {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  padding: 0.25rem;
  font: inherit;
  color: inherit;
  background: none;
  border: 0;
  border-radius: 0.25rem;
  cursor: pointer;
}
.interactivity-switch:focus-visible {
  outline: 3px solid var(--color-link);
  outline-offset: 2px;
}
.switch-track {
  position: relative;
  display: inline-block;
  width: 3.25rem;
  height: 1.75rem;
  border-radius: 0.875rem;
  background-color: #949494;
  transition: background-color 0.15s ease-out;
}
.switch-thumb {
  position: absolute;
  top: 0.2rem;
  left: 0.2rem;
  width: 1.35rem;
  height: 1.35rem;
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  transition: transform 0.15s ease-out;
}
.interactivity-switch[aria-checked='true'] .switch-track {
  background-color: var(--color-link);
}
.interactivity-switch[aria-checked='true'] .switch-thumb {
  transform: translateX(1.5rem);
}
</style>
