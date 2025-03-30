<script setup lang="ts">
import Input from '../src'
</script>

<template>
  <Input prefix-cls="vc-input">
    <template #addonBefore>
      <span>https://</span>
    </template>
  </Input>
  <br>
  <br>
  <Input prefix-cls="vc-input">
    <template #addonAfter>
      <span>MB</span>
    </template>
  </Input>
</template>

<style scoped>

</style>
