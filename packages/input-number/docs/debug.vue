<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import InputNumber from '../src'

const value = ref<string | number>(5)

function keyDown(event: KeyboardEvent) {
  if ((event.ctrlKey === true || event.metaKey) && event.keyCode === 90) {
    value.value = 3
  }
}

onMounted(() => {
  document.addEventListener('keydown', keyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', keyDown)
})

function onChange(nextValue: any) {
  console.log('Change:', nextValue)
  value.value = nextValue
}
</script>

<template>
  <div>
    <InputNumber
      v-model:value="value"
      :style="{ width: '100px' }"
      @change="onChange"
    />
    {{ value }}
    <button @click="() => value = 99">
      Change
    </button>
  </div>
</template>

<style scoped>
</style>
