<script setup lang="ts">
import type { TabsProps } from '../src'
import { h } from 'vue'
import Tabs from '../src'
import '../assets/index.less'

const items: NonNullable<TabsProps['items']> = [
  { key: '1', label: 'Tab 1', style: { height: '200px' }, children: 'Content of Tab Pane 1' },
  { key: '2', label: 'Tab 2', children: 'Content of Tab Pane 2' },
  { key: '3', label: 'Tab 3', children: 'Content of Tab Pane 3' },
]

function renderTabBar(props: Record<string, any>, DefaultTabBar: any) {
  return h(DefaultTabBar, {
    ...props,
    className: 'site-custom-tab-bar',
    style: { position: 'sticky', top: '0px', zIndex: 1, background: '#fff' },
  })
}
</script>

<template>
  <div :style="{ height: '2000px' }">
    <Tabs
      default-active-key="1"
      :render-tab-bar="renderTabBar"
      :items="items"
    />
  </div>
</template>

<style src="../assets/index.less" lang="less"></style>
