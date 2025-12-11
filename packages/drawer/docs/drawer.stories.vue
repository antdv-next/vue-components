<script setup lang="ts">
import Base from './base.vue'
import BodyProps from './body-props.vue'
import ChangeRemove from './change-remove.vue'
import Change from './change.vue'
import ForceRender from './force-render.vue'
import GetContainer from './get-container.vue'
import Multiple from './multiple.vue'
import NoMask from './no-mask.vue'
import Placement from './placement.vue'
import Resizable from './resizable.vue'

import './assets/common.less'
</script>

<template>
  <Story title="Drawer">
    <Variant title="base">
      <Base />
    </Variant>
    <Variant title="bodyProps">
      <BodyProps />
    </Variant>
    <Variant title="change">
      <Change />
    </Variant>
    <Variant title="changeRemove">
      <ChangeRemove />
    </Variant>
    <Variant title="forceRender">
      <ForceRender />
    </Variant>
    <Variant title="getContainer">
      <GetContainer />
    </Variant>
    <Variant title="multiple">
      <Multiple />
    </Variant>
    <Variant title="noMask">
      <NoMask />
    </Variant>
    <Variant title="placement">
      <Placement />
    </Variant>
    <Variant title="resizable">
      <Resizable />
    </Variant>
  </Story>
</template>

<style scoped>

</style>
