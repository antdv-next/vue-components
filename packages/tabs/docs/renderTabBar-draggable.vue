<script setup lang="ts">
import type { TabsProps } from '../src'
import { computed, ref } from 'vue'
import Tabs from '../src'
import { useRenderTabBar } from './renderTabbar.vue'
import '../assets/index.less'

const baseItems: NonNullable<TabsProps['items']> = [
  { key: '1', label: 'tab 1', children: 'Content of Tab Pane 1' },
  { key: '2', label: 'tab 2', children: 'Content of Tab Pane 2' },
  { key: '3', label: 'tab 3', children: 'Content of Tab Pane 3' },
]

const order = ref<string[]>([])
const draggingKey = ref<string | undefined>()

function moveTabNode(dragKey: string, hoverKey: string) {
  const newOrder = order.value.slice()
  baseItems.forEach((item) => {
    if (!newOrder.includes(item.key))
      newOrder.push(item.key)
  })
  const dragIndex = newOrder.indexOf(dragKey)
  const hoverIndex = newOrder.indexOf(hoverKey)
  newOrder.splice(dragIndex, 1)
  newOrder.splice(hoverIndex, 0, dragKey)
  order.value = newOrder
}

const orderedItems = computed(() => {
  const tabs = [...baseItems]
  const idx = (k: string) => order.value.indexOf(k)
  return tabs.slice().sort((a, b) => {
    const ia = idx(a.key)
    const ib = idx(b.key)
    if (ia !== -1 && ib !== -1)
      return ia - ib
    if (ia !== -1)
      return -1
    if (ib !== -1)
      return 1
    const ta = tabs.indexOf(a)
    const tb = tabs.indexOf(b)
    return ta - tb
  })
})

function onDragStart(key: string) {
  draggingKey.value = key
}

function onDrop(targetKey: string) {
  if (draggingKey.value)
    moveTabNode(draggingKey.value, targetKey)
  draggingKey.value = undefined
}

function onDragEnd() {
  draggingKey.value = undefined
}

const renderTabBar = useRenderTabBar(onDragStart, onDrop, onDragEnd)
</script>

<template>
  <div :style="{ maxWidth: '550px' }">
    <Tabs :render-tab-bar="renderTabBar" :items="orderedItems" />
  </div>
</template>

<style src="../assets/index.less" lang="less"></style>
