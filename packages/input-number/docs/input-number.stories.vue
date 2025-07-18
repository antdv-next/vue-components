<script setup lang="ts">
import CombinationKeyFormat from './combination-key-format.vue'
import Custom from './custom.vue'
import Debug from './debug.vue'
import Decimal from './decimal.vue'
import Focus from './focus.vue'
import Formatter from './formatter.vue'
import InputControl from './input-control.vue'
import OnStep from './on-step.vue'
import Precision from './precision.vue'
import Simple from './simple.vue'
import SmallStep from './small-step.vue'
import Wheel from './wheel.vue'

import './assets/index.less'
</script>

<template>
  <Story title="InputNumber">
    <Variant title="simple">
      <Simple />
    </Variant>
    <Variant title="combination-key-format">
      <CombinationKeyFormat />
    </Variant>
    <Variant title="custom">
      <Custom />
    </Variant>
    <Variant title="debug">
      <Debug />
    </Variant>
    <Variant title="decimal">
      <Decimal />
    </Variant>
    <Variant title="formatter">
      <Formatter />
    </Variant>
    <Variant title="input-control">
      <InputControl />
    </Variant>
    <Variant title="precision">
      <Precision />
    </Variant>
    <Variant title="small-step">
      <SmallStep />
    </Variant>
    <Variant title="on-step">
      <OnStep />
    </Variant>
    <Variant title="wheel">
      <Wheel />
    </Variant>
    <Variant title="focus">
      <Focus />
    </Variant>
  </Story>
</template>

<style scoped>

</style>
