<script setup lang="ts">
import InputNumber from '../src'
</script>

<template>
  <div style="margin: 10px">
    <InputNumber
      style="width: 100px"
      :default-value="10"
      :change-on-blur="false"
      change-on-wheel
    />
  </div>
</template>

<style scoped>

</style>
