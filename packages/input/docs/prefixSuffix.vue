<script setup lang="ts">
import Input from '../src'
</script>

<template>
  <Input prefix-cls="vc-input">
    <template #prefix>
      prefix
    </template>
  </Input>
  <br>
  <br>
  <Input prefix-cls="vc-input">
    <template #suffix>
      suffix
    </template>
  </Input>
</template>

<style scoped>

</style>
