<script setup lang="ts">
import type { TabsProps } from '../src'
import { computed, ref } from 'vue'
import Tabs from '../src'
import '../assets/index.less'

const items: NonNullable<TabsProps['items']> = []
for (let i = 0; i < 12; i += 1) {
  items.push({ key: String(i), label: `Tab ${i}`, children: `Content of ${i}` })
}

const modes = ['auto', 'start', 'center', 'end', 'custom'] as const

const mode = ref<(typeof modes)[number]>('center')
const customRatio = ref(0.25)
const activeKey = ref('0')

const scrollPosition = computed<TabsProps['scrollPosition']>(() => {
  if (mode.value === 'auto') {
    return undefined
  }
  if (mode.value === 'custom') {
    return customRatio.value
  }
  return mode.value
})
</script>

<template>
  <p>
    `scrollPosition` 决定切换 tab 时激活项对齐到视口的什么位置。
    `auto`（不传）保持原有的"仅贴边时才滚动"行为。
  </p>

  <div :style="{ maxWidth: '420px' }">
    <Tabs
      :active-key="activeKey"
      :items="items"
      :scroll-position="scrollPosition"
      :on-change="(key: string) => { activeKey = key }"
    />
  </div>

  <div :style="{ marginTop: '16px' }">
    <label v-for="item of modes" :key="item" :style="{ marginRight: '12px' }">
      <input v-model="mode" type="radio" :value="item">
      {{ item }}
    </label>
  </div>

  <div v-if="mode === 'custom'" :style="{ marginTop: '8px' }">
    <label>
      ratio:
      <input v-model.number="customRatio" type="number" step="0.25" min="-1" max="2" :style="{ width: '70px' }">
    </label>
    <span :style="{ marginLeft: '8px', color: '#999' }">超出 0~1 会被 clamp</span>
  </div>

  <div :style="{ marginTop: '12px' }">
    <button type="button" @click="activeKey = '0'">
      First
    </button>
    <button type="button" @click="activeKey = '6'">
      Middle
    </button>
    <button type="button" @click="activeKey = '11'">
      Last
    </button>
    <span :style="{ marginLeft: '8px', color: '#999' }">
      切换 tab 时观察激活项的对齐位置
    </span>
  </div>
</template>
