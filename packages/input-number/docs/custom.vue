<script setup lang="ts">
import { h, ref } from 'vue'
import InputNumber from '../src'

const disabled = ref(false)
const readOnly = ref(false)
const value = ref(5)
function onChange(data: any) {
  console.log('onChange:', data)
  value.value = data
}

const upHandler = h('div', { style: { color: 'blue' } }, 'x')
const downHandler = h('div', { style: { color: 'red' } }, 'v')
</script>

<template>
  <div style="margin: 10px">
    <InputNumber
      v-model:value="value"
      aria-label="Number input example that demonstrates custom styling"
      :min="-8"
      :max="10"
      style="width: 100px"
      :read-only="readOnly"
      :disabled="disabled"
      @change="onChange"
    >
      <template #upHandler>
        <upHandler />
      </template>
      <template #downHandler>
        <downHandler />
      </template>
    </InputNumber>
  </div>
</template>

<style scoped>

</style>
