<script setup lang="ts">
import { ref } from 'vue'
import Input from '../src'

const output = ref('')
function handleChange(e: any) {
  output.value = e.target.value
}
</script>

<template>
  <Input prefix-cls="vc-input" allow-clear placeholder="uncontrolled" />
  <br>
  <br>
  <Input
    prefix-cls="vc-input"
    allow-clear
    :value="output"
    placeholder="controlled"
    @change="handleChange"
  >
    <template #clearIcon>
      x
    </template>
  </Input>
</template>

<style scoped>

</style>
