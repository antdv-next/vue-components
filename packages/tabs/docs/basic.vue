<script setup lang="ts">
import { ref } from 'vue'
import Tabs from '../src/index'

const destroy = ref(false)
const items = ref([
  { label: 'Light', key: 'light', children: 'Light!', icon: '🌞' },
  { label: 'Bamboo', key: 'bamboo', children: 'Bamboo!', icon: '🎋' },
  { label: 'Cute', key: 'cute', children: 'Cute!', disabled: true, icon: '🐼' },
  { label: 'Yo', key: 'yo', children: 'Yo!', icon: '👋' },
])
const direction = ref<'ltr' | 'rtl'>('ltr')

function onTabClick(key: string) {
  console.log('onTabClick', key)
}

function onTabChange(key: string) {
  console.log('onTabChange', key)
}
</script>

<template>
  <div>
    <Tabs
      tab-bar-extra-content="extra"
      :on-tab-click="onTabClick"
      :on-change="onTabChange"
      :direction="direction"
      :items="items"
    />

    <button
      type="button"
      @click="() => { items = [{ key: 'yo', label: 'Yo', children: 'Yo!', icon: '👋' }] }"
    >
      Change children
    </button>

    <button
      type="button"
      @click="() => { destroy = true }"
    >
      Destroy
    </button>

    <button
      type="button"
      @click="() => { direction = direction === 'ltr' ? 'rtl' : 'ltr' }"
    >
      {{ direction === 'ltr' ? 'rtl' : 'ltr' }}
    </button>
  </div>

</template>

<style src="../assets/index.less" lang="less"></style>