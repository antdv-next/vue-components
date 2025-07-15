<script setup lang="ts">
import { h } from 'vue'
import { ColorBlock } from '../src'

const colorPresets = [
  '#F5222D',
  '#FA8C16',
  '#FADB14',
  '#8BBB11',
  '#52C41A',
  '#13A8A8',
  '#1677FF',
  '#2F54EB',
  '#722ED1',
  '#EB2F96',
  '#F5222D4D',
  '#FA8C164D',
  '#FADB144D',
  '#8BBB114D',
  '#52C41A4D',
  '#13A8A84D',
  '#1677FF4D',
  '#2F54EB4D',
  '#722ED14D',
  '#EB2F964D',
]
// const ColorBlock = h(Block)
</script>

<template>
  <div style="display: flex; flex-wrap: nowrap">
    <span v-for="color in colorPresets" :key="color">
      <ColorBlock :color="color" prefixCls="vc-color-picker" />
    </span>
  </div>
</template>

<style scoped>

</style>
