<script setup lang="ts">
import Basic from './basic'
import EndlessScrolling from './endless-scrolling'
import Group from './group'
import LoadOnDemand from './load-on-demand'
import NoVirtual from './no-virtual'
import Rtl from './rtl'
import ScrollTo from './scroll-to'
import Semantic from './semantic'
import './assets/index.less'
</script>

<template>
  <Story title="Listy">
    <Variant title="Basic">
      <Basic />
    </Variant>
    <Variant title="Endless Scrolling">
      <EndlessScrolling />
    </Variant>
    <Variant title="Group">
      <Group />
    </Variant>
    <Variant title="Load On Demand">
      <LoadOnDemand />
    </Variant>
    <Variant title="No Virtual">
      <NoVirtual />
    </Variant>
    <Variant title="RTL">
      <Rtl />
    </Variant>
    <Variant title="Scroll To">
      <ScrollTo />
    </Variant>
    <Variant title="Semantic">
      <Semantic />
    </Variant>
  </Story>
</template>
