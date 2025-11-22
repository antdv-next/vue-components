<script setup lang="ts">
import { computed, h, ref } from 'vue'
import Tabs from '../src/index'

const items = Array.from({ length: 50 }).map((_, i) => ({
  key: String(i),
  label: `Tab ${i}`,
  children: `Content of ${i}`,
}))

const key = ref('0')

const extra = computed(() => (key.value === '0' ? h('div',{}, ['额外内容']) : null))
</script>

<template>
  <div :style="{ maxWidth: '550px' }">
    <Tabs
      :active-key="key"
      :on-change="curKey => (key = curKey)"
      :tab-bar-extra-content="extra"
      default-active-key="8"
      :items="items"
    />
  </div>

</template>

<style src="../assets/index.less" lang="less"></style>