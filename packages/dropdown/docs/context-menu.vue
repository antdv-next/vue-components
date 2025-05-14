<script setup lang="ts">
import Dropdown from '../src'
import MockMenu from './mock-menu.vue'
</script>

<template>
  <Dropdown
    :trigger="['contextMenu']"
    animation="slide-up"
    align-point
    @visible-change="args => console.log('click', args)"
  >
    <div
      role="button"
      style="
        border: 1px solid #000;
        padding: 100px 0;
        text-align: center;
      "
    >
      Right click me!
    </div>
    <template #overlay>
      <MockMenu />
    </template>
  </Dropdown>
</template>

<style scoped>

</style>
