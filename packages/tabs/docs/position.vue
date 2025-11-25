<script setup lang="ts">
import Tabs from '../src'
import { ref } from 'vue'
import '../assets/index.less'

const position = ref<'left' | 'right' | 'top' | 'bottom'>('left')
const gutter = ref(false)
const fixedHeight = ref(false)

const items = [
  { key: 'light', label: 'Light', children: 'Light!' },
  { key: 'bamboo', label: 'Bamboo', children: 'Bamboo!' },
  { key: 'cat', label: 'Cat', children: 'Cat!' },
  { key: 'miu', label: 'Miu', children: 'Miu!' },
  { key: '333', label: '333', children: '333!' },
  { key: '444', label: '444', children: '444!' },
]
</script>

<template>
  <div>
    <select v-model="position">
      <option value="left">left</option>
      <option value="right">right</option>
      <option value="top">top</option>
      <option value="bottom">bottom</option>
    </select>
    <label>
      <input type="checkbox" v-model="fixedHeight" />
      Fixed Height
    </label>
    <label>
      <input type="checkbox" v-model="gutter" />
      Set Gutter
    </label>
    <Tabs
      :tab-bar-extra-content="233"
      :tab-position="position"
      :style="{ height: fixedHeight ? '180px' : undefined }"
      :tab-bar-gutter="gutter ? 16 : undefined"
      :items="items"
    />
  </div>
  
</template>

<style scoped>

</style>