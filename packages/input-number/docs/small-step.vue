<script setup lang="ts">
import { ref } from 'vue'
import InputNumber from '../src'

const stringMode = ref(false)
const value = ref<number | string>(0.000000001)

function onChange(newValue: any) {
  console.log('onChange:', newValue)
  value.value = newValue
}
</script>

<template>
  <div style="margin: 10px">
    <InputNumber
      v-model:value="value"
      aria-label="Number input example of very small increments"
      :min="-10"
      :max="10"
      :step="stringMode ? '0.000000001' : 0.000000001"
      style="width: 200px"
      :string-mode="stringMode"
      @change="onChange"
    />

    <label>
      <input
        v-model="stringMode"
        type="checkbox"
      >
      String Mode
    </label>
  </div>
</template>

<style scoped>
</style>
