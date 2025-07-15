<script setup lang="ts">
import { computed, h, ref } from 'vue'
import ColorPicker, { type Color } from '../src'

function toHexFormat(value?: string) {
  return value?.replace(/[^0-9a-fA-F#]/g, '').slice(0, 9) || ''
}
const colorValue = ref<Color | string>('#163cff')
const color = computed(() =>
  typeof colorValue.value === 'string'
    ? colorValue.value
    : colorValue.value.a < 1
      ? colorValue.value.toHexString()
      : colorValue.value.toHexString())
function panelRender(panel: any) {
  return h(
    'div',
    {
      class: 'custom-panel',
    },
    [
      h(panel),
      h('input', {
        value: color.value,
        onInput: (e) => {
          colorValue.value = toHexFormat(e.target!.value)
        },
      }),
    ],
  )
}
</script>

<template>
  <div style="width: 240px">
    <ColorPicker v-model:value="colorValue" :panel-render="panelRender" />
  </div>
</template>

<style scoped>

</style>
