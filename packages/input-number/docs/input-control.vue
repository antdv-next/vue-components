<script setup lang="ts">
/* eslint no-console:0 */
import { ref } from 'vue'
import InputNumber from '../src'

const value = ref('aaa')
const lock = ref(false)

function onChange(newValue: any) {
  console.log('Change:', newValue)
}

function onInput(text: any) {
  console.log('Input:', text)
  if (!lock.value) {
    value.value = text
  }
}
</script>

<template>
  <div>
    <InputNumber
      v-model:value="value"
      :max="999"
      @change="onChange"
      @input="onInput"
    />

    <button @click="() => lock = !lock">
      Lock Value ({{ String(lock) }})
    </button>
    <button @click="() => value = '93'">
      Change Value
    </button>
  </div>
</template>

<style scoped>
</style>
