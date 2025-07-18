<script setup lang="ts">
import ArrowContent from './arrowContent.vue'
import FormError from './formError.vue'
import OnVisibleChange from './onVisibleChange.vue'
import Placement from './placement.vue'
import Point from './point.vue'
import ShowArrow from './showArrow.vue'
import Simple from './simple.vue'
</script>

<template>
  <Story title="Tooltip">
    <Variant title="arrowContent">
      <ArrowContent />
    </Variant>
    <Variant title="formError">
      <FormError />
    </Variant>
    <Variant title="onVisibleChange">
      <OnVisibleChange />
    </Variant>
    <Variant title="placement">
      <Placement />
    </Variant>
    <Variant title="point">
      <Point />
    </Variant>
    <Variant title="showArrow">
      <ShowArrow />
    </Variant>
    <Variant title="simple">
      <Simple />
    </Variant>
  </Story>
</template>

<style scoped>

</style>
