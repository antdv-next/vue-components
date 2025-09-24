<script setup>
import { ref } from 'vue'
import Slider from '../src'

const disabled = ref(false)
const range = ref(false)
const reverse = ref(false)
const vertical = ref(false)
const data = ref()

function handleSliderChange(nextValues) {
  console.log('Change:', nextValues)
}

function handleSliderChangeComplete(v) {
  console.log('AfterChange:', v)
}
</script>

<template>
  <div>
    <div>
      <label>
        <input v-model="disabled" type="checkbox">
        Disabled
      </label>
      <label>
        <input v-model="range" type="checkbox">
        Range
      </label>
      <label>
        <input v-model="reverse" type="checkbox">
        Reverse
      </label>
      <label>
        <input v-model="vertical" type="checkbox">
        Vertical
      </label>
    </div>

    <div style="height: 300px; width: 600px;">
      <Slider
        v-model:value="data"
        :disabled="disabled"
        :step="0.01"
        :default-value="0.81"
        :min="0"
        :max="1"
        :vertical="vertical"
        :reverse="reverse"
        @change="handleSliderChange"
        @change-complete="handleSliderChangeComplete"
      />
    </div>
  </div>
</template>

<style scoped>
</style>
