<script setup lang="ts">
import { ref } from 'vue'
import InputNumber from '../src'

const disabled = ref(false)
const readOnly = ref(false)
const value = ref(99)

function onChange(v: any) {
  console.log('onChange:', v)
  value.value = v
}

function toggleDisabled() {
  disabled.value = !disabled.value
}

function toggleReadOnly() {
  readOnly.value = !readOnly.value
}
</script>

<template>
  <div style="margin: 10px">
    <p>Value Range is [-8, 10], initialValue is out of range.</p>
    <InputNumber
      v-model:value="value"
      aria-label="Number input example that demonstrates using decimal values"
      :min="-8"
      :max="10"
      :step="0.1"
      :style="{ width: '100px' }"
      :read-only="readOnly"
      :disabled="disabled"
      @change="onChange"
    />
    <p>
      <button type="button" @click="toggleDisabled">
        toggle Disabled
      </button>
      <button type="button" @click="toggleReadOnly">
        toggle readOnly
      </button>
    </p>
  </div>
</template>

<style scoped>
</style>
