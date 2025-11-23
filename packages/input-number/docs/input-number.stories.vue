<script setup lang="ts">
import CombinationKeyFormat from './combination-key-format'
import Custom from './custom'
import Debug from './debug'
import Decimal from './decimal'
import Focus from './focus'
import Formatter from './formatter'
import InputControl from './input-control'
import OnStep from './on-step'
import Precision from './precision'
import Simple from './simple'
import SmallStep from './small-step'
import Wheel from './wheel'
import PrefixSuffix from './prefix-suffix'
import Spinner from './spinner'

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
    <Variant title="prefix-suffix">
      <PrefixSuffix />
    </Variant>
    <Variant title="spinner">
      <Spinner />
    </Variant>
  </Story>
</template>

<style scoped>

</style>
