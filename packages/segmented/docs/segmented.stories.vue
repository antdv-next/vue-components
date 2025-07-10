<script setup lang="ts">
import Basic from './basic.vue'
import Rtl from './rtl.vue'
import './assets/style.less'
</script>

<template>
  <Story title="Segmented">
    <Variant title="basic">
      <Basic />
    </Variant>
    <Variant title="rtl">
      <Rtl />
    </Variant>
  </Story>
</template>

<style scoped>

</style>
