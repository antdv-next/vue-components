<script setup lang="ts">
import { ref } from 'vue'
import Textarea from '../src'

const data = ref('')
function onChange(e: Event) {
  console.log((e.target as HTMLInputElement).value)
}
function onResize({ width, height }: { width: number, height: number }) {
  console.log(`size is changed, width:${width} height:${height}`)
}
function onPressEnter() {
  console.log(`enter key is pressed`)
}
</script>

<template>
  <Textarea
    v-model:value="data"
    prefix-cls="custom-textarea"
    auto-focus
    @press-enter="onPressEnter"
    @resize="onResize"
    @change="onChange"
    @composition-start="onChange"
    @focus="() => console.log('focus')"
  />
</template>

<style scoped>

</style>
