<script setup lang="ts">
import Basic from './basic'
import Blink from './blink'
import FillWidth from './fill-width'
import RawRender from './raw-render'

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
