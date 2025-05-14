<script setup lang="ts">
import Arrow from './arrow.vue'
import ContextMenu from './context-menu.vue'
import DropdownMenuWidth from './dropdown-menu-width.vue'
import Multiple from './multiple.vue'
import Simple from './simple.vue'
import './assets/index.less'
</script>

<template>
  <Story title="Dropdown">
    <Variant title="arrow">
      <Arrow />
    </Variant>
    <Variant title="context-menu">
      <ContextMenu />
    </Variant>
    <Variant title="dropdown-menu-width">
      <DropdownMenuWidth />
    </Variant>
    <Variant title="multiple">
      <Multiple />
    </Variant>
    <Variant title="simple">
      <Simple />
    </Variant>
  </Story>
</template>

<style scoped>

</style>
