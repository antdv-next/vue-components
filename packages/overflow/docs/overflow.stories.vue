<script setup lang="ts">
import Basic from './basic.vue'
import Blink from './blink.vue'
import FillWidth from './fill-width.vue'
import RawRender from './raw-render.vue'

import './assets/index.less'
import './assets/common.less'
</script>

<template>
  <Story title="Overflow">
    <Variant title="basic">
      <Basic />
    </Variant>
    <Variant title="blink">
      <Blink />
    </Variant>
    <Variant title="fill-width">
      <FillWidth />
    </Variant>
    <Variant title="raw-render">
      <RawRender />
    </Variant>
  </Story>
</template>

<style scoped>

</style>
