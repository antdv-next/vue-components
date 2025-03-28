<script setup lang="ts">
import Debug from './debug.vue'
import Editable from './editable.vue'
import Handle from './handle.vue'
import Marks from './marks.vue'
import Multiple from './multiple.vue'
import Range from './range.vue'
import SliderDemo from './sliderDemo.vue'
import Vertical from './vertical.vue'

import '../docs/assets/index.less'
</script>

<template>
  <Story title="Slider">
    <Variant title="debug">
      <Debug />
    </Variant>
    <Variant title="Editable">
      <Editable />
    </Variant>
    <Variant title="Handle">
      <Handle />
    </Variant>
    <Variant title="Marks">
      <Marks />
    </Variant>
    <Variant title="Multiple">
      <Multiple />
    </Variant>
    <Variant title="Range">
      <Range />
    </Variant>
    <Variant title="Slider">
      <SliderDemo />
    </Variant>
    <Variant title="Vertical">
      <Vertical />
    </Variant>
  </Story>
</template>

<style scoped>

</style>
