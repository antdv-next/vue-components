<script setup lang="ts">
import { ref } from 'vue'
import ColorPicker from '../src'

const hexValue = ref('#1677ff')
const rgbValue = ref('#1677ff')
const hsbValue = ref('#1677ff')
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 24px;">
    <div style="width: 260px; display: flex; flex-direction: column; gap: 8px;">
      <h3>HEX String</h3>
      <ColorPicker v-model:value="hexValue" value-format="hex" />
      <span>value: {{ hexValue }}</span>
    </div>

    <div style="width: 260px; display: flex; flex-direction: column; gap: 8px;">
      <h3>RGB String</h3>
      <ColorPicker v-model:value="rgbValue" value-format="rgb" />
      <span>value: {{ rgbValue }}</span>
    </div>

    <div style="width: 260px; display: flex; flex-direction: column; gap: 8px;">
      <h3>HSB String</h3>
      <ColorPicker v-model:value="hsbValue" value-format="hsb" />
      <span>value: {{ hsbValue }}</span>
    </div>
  </div>
</template>

<style scoped>

</style>
