<script setup lang="ts">
import type { TabsProps } from '../src'
import { ref } from 'vue'
import Tabs from '../src'
import '../assets/index.less'

const items: NonNullable<TabsProps['items']> = []
for (let i = 0; i < 12; i += 1) {
  items.push({ key: String(i), label: `Tab ${i}`, children: `Content of ${i}` })
}

const gutter = ref(true)
const destroy = ref(false)
</script>

<template>
  <div :style="{ height: '2000px' }">
    <div :style="{ maxWidth: '550px' }">
      <Tabs
        v-if="!destroy"
        :tab-bar-gutter="gutter ? 32 : undefined"
        tab-bar-extra-content="extra"
        default-active-key="8"
        :items="items"
      />
    </div>

    <label>
      <input v-model="gutter" type="checkbox">
      Set `tabBarGutter`
    </label>
    <button type="button" @click="() => { destroy = true }">
      Destroy
    </button>
  </div>
</template>
