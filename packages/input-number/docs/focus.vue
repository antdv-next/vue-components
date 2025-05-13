<script setup lang="ts">
import { ref } from 'vue'
import InputNumber from '../src'

const inputRef = ref<InstanceType<typeof InputNumber> | null>(null)
const value = ref(10)
</script>

<template>
  <div style="margin: 10px">
    <InputNumber
      ref="inputRef"
      v-model:value="value"
      aria-label="focus example"
      :style="{ width: '100px' }"
    />
    <div style="margin-top: 10px">
      <button type="button" @click="() => inputRef?.focus({ cursor: 'start' })">
        focus at start
      </button>
      <button type="button" @click="() => inputRef?.focus({ cursor: 'end' })">
        focus at end
      </button>
      <button type="button" @click="() => inputRef?.focus({ cursor: 'all' })">
        focus to select all
      </button>
      <button type="button" @click="() => inputRef?.focus({ preventScroll: true })">
        focus prevent scroll
      </button>
    </div>
  </div>
</template>

<style scoped>
</style>
