<script setup lang="ts">
import Tabs from '../src/index'

const items = [
  { label: 'Light', key: 'light', children: 'Light!' },
  { label: 'Bamboo', key: 'bamboo', children: 'Bamboo!' },
  { label: 'Cute', key: 'cute', children: 'Cute!' },
]

function indicatorSize(origin: number) {
  return Math.max(origin - 20, 0)
}
</script>

<template>
  <div>
    <Tabs tab-position="top" :items="items" :indicator="{ size: indicatorSize, align: 'start' }" />
    <Tabs tab-position="top" :items="items" :indicator="{ size: indicatorSize, align: 'center' }" />
    <Tabs tab-position="top" :items="items" :indicator="{ size: indicatorSize, align: 'end' }" />

    <Tabs tab-position="left" :items="items" :indicator="{ size: indicatorSize, align: 'start' }" />
    <Tabs tab-position="left" :items="items" :indicator="{ size: indicatorSize, align: 'center' }" />
    <Tabs tab-position="left" :items="items" :indicator="{ size: indicatorSize, align: 'end' }" />
  </div>
</template>

<style src="../assets/index.less" lang="less"></style>
