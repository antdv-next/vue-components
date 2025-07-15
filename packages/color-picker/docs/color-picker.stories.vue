<script setup lang="ts">
import Basic from './basic.vue'
import Block from './block.vue'
import CustomRender from './customRender.vue'
import Disabled from './disabled.vue'
import DisabledAlpha from './disabledAlpha.vue'
import './assets/index.less'
</script>

<template>
  <Story title="ColorPicker">
    <Variant title="Basic">
      <Basic />
    </Variant>
    <Variant title="Disabled">
      <Disabled />
    </Variant>
    <Variant title="Disabled Alpha">
      <DisabledAlpha />
    </Variant>
    <Variant title="CustomRender">
      <CustomRender />
    </Variant>
    <Variant title="Block">
      <Block />
    </Variant>
  </Story>
</template>

<style scoped>

</style>
