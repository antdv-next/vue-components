<script setup lang="ts">
import { ref } from 'vue'
import Textarea from '../src'

const data = ref('hello\nworld')
function onChange(e: Event) {
  console.log((e.target as HTMLInputElement).value)
}
function onResize({ width, height }: { width: number, height: number }) {
  console.log(`size is changed, width:${width} height:${height}`)
}
</script>

<template>
  <div>
    <p>when set to true</p>
    <Textarea
      v-model:value="data"
      auto-size
      @resize="onResize"
      @change="onChange"
    />
    <p>when set to object of minRows and maxRows</p>
    <Textarea
      v-model:value="data"
      :auto-size="{ minRows: 5, maxRows: 15 }"
      @resize="onResize"
      @change="onChange"
    />
  </div>
</template>

<style scoped>

</style>
