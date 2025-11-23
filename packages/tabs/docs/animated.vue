<script setup lang="ts">
import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import Tabs from '../src/index'

const motion: CSSMotionProps = {
  name: 'switch',
  appear: false,
}

const items = [
  {
    label: 'Light',
    key: 'light',
    children: 'Light!',
    style: { height: 200, background: 'rgba(255, 0, 0, 0.05)' },
  },
  {
    label: 'Bamboo',
    key: 'bamboo',
    children: 'Bamboo!',
    style: { height: 100, background: 'rgba(0, 255, 0, 0.05)' },
  },
  {
    label: 'Cute',
    key: 'cute',
    children: 'Cute!',
    style: { background: 'rgba(0, 0, 255, 0.05)' },
  },
]
</script>

<template>
  <Tabs :animated="{ tabPaneMotion: motion }" :items="items" />
</template>

<style src="../assets/index.less" lang="less"></style>

<style src="./animated.less" lang="less"></style>
