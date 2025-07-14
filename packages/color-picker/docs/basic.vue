<script setup lang="ts">
import { ref } from 'vue'
import ColorPicker, { Color } from '../src'

const start = ref(true)
const colorValue = ref(new Color('rgba(255,0,0,0)'))
</script>

<template>
  <ColorPicker
    v-model:value="colorValue"
    @change="nextValue => {
      let proxyValue = nextValue;
      if (start.value) {
        start.value = false;
        proxyValue = nextValue.setA(1);
      }

      // colorValue.value = proxyValue
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
