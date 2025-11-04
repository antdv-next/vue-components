<script setup lang="ts">
import ArrowContent from './arrow-content'
import FormError from './form-error'
import OnVisibleChange from './on-visible-change'
import Placement from './placement'
import Point from './point'
import ShowArrow from './show-arrow'
import Simple from './simple'
import TwoButtons from './two-buttons'
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
    <Variant title="twoButtons">
      <TwoButtons />
    </Variant>
  </Story>
</template>
