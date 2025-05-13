<script setup lang="ts">
import { ref } from 'vue'
import InputNumber from '../src'

const value = ref<string | number>('')
const precision = ref<string>('2')
const decimalSeparator = ref<string>(',')

function onChange(newValue: any) {
  console.log('onChange:', newValue)
  value.value = newValue
}
</script>

<template>
  <div style="margin: 10px">
    <InputNumber
      v-model:value="value"
      aria-label="Number input example to demonstration custom precision value"
      style="width: 100px"
      :precision="Number(precision)"
      :decimal-separator="decimalSeparator"
      @change="onChange"
    />
    <div style="margin-top: 32px">
      <label>
        precision:
        <input
          v-model="precision"
          type="number"
        >
      </label>
      <label>
        decimalSeparator:
        <input v-model="decimalSeparator">
      </label>
    </div>
  </div>
</template>

<style scoped>
</style>
