<script setup lang="ts">
/* eslint no-console:0 */
import { ref } from 'vue'
import InputNumber from '../src'

const emitter = ref('interface buttons (up)')
const value = ref<string | number>(0)

function onChange(val: number) {
  console.warn('onChange:', val, typeof val)
  value.value = val
}

function onStep(_: number, info: { offset: number, type: 'up' | 'down', emitter: 'handler' | 'keyboard' | 'wheel' }) {
  console.log('onStep:', info)
  if (info.emitter === 'handler') {
    emitter.value = `interface buttons (${info.type})`
  }

  if (info.emitter === 'keyboard') {
    emitter.value = `keyboard (${info.type})`
  }

  if (info.emitter === 'wheel') {
    emitter.value = `mouse wheel (${info.type})`
  }
}
</script>

<template>
  <div style="margin: 10px">
    <h3>onStep callback</h3>
    <InputNumber
      v-model:value="value"
      aria-label="onStep callback example"
      :min="0"
      :max="10"
      style="width: 100px"
      change-on-wheel
      @change="onChange"
      @step="onStep"
    />

    <div style="margin-top: 10px">
      Triggered by: {{ emitter }}
    </div>
  </div>
</template>

<style scoped>
</style>
