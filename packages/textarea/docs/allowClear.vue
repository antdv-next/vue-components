<script setup lang="ts">
import { ref } from 'vue'
import Textarea from '../src'

const data = ref('hello\nworld')
function onChange(e: Event) {
  console.log('clear', (e.target as HTMLInputElement).value)
}
</script>

<template>
  <div>
    <p>Uncontrolled</p>
    <Textarea auto-size allow-clear />
    <p>controlled</p>
    <Textarea v-model:value="data" allow-clear @change="onChange" />
  </div>
</template>

<style scoped>

</style>
