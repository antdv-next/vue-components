<script setup lang="ts">
import { ref } from 'vue'
import ColorPicker, { Color } from '../src'

const colorValue = ref(new Color('rgba(255,0,0,0)'))
</script>

<template>
  <ColorPicker
    v-model:value="colorValue"
    @change="nextValue => {
      console.log('basic-demo', nextValue)
    }"
  />
  <br>
  <div style="width: 258px; display: flex; flex-direction: column; gap: 8px;">
    <span> hex: {{ colorValue.toHexString() }}</span>
    <span> rgb: {{ colorValue.toRgbString() }}</span>
    <span> hsb: {{ colorValue.toHsbString() }}</span>
  </div>
</template>

<style scoped>

</style>
