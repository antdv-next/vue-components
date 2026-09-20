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
const directions = ['ltr', 'rtl'] as const
const positions = ['top', 'bottom', 'left', 'right'] as const

type ScrollMode = (typeof modes)[number]

const mode = ref<ScrollMode>('center')
const customRatio = ref(0.25)
const direction = ref<(typeof directions)[number]>('ltr')
const tabPosition = ref<NonNullable<TabsProps['tabPosition']>>('top')
const activeKey = ref('6')

const scrollPosition = computed<TabsProps['scrollPosition']>(() => {
  if (mode.value === 'auto') {
    return undefined
  }
  if (mode.value === 'custom') {
    return customRatio.value
  }
  return mode.value
})

const shortcuts = [
  { label: 'First', key: '0' },
  { label: 'Middle', key: '6' },
  { label: 'Last', key: '11' },
]
</script>

<template>
  <p>
    `scrollPosition` 决定切换 tab 时激活项对齐到视口的什么位置。
    `auto`（不传）保持原有行为——只有贴边时才滚动；`start` / `center` / `end`
    对齐到视口对应侧，传数字则按比例对齐（会 clamp 到 0~1）。
    注意 `left` / `right` 走的是独立的纵向分支，用下面的 `tabPosition` 切换即可验证。
  </p>

  <div :style="{ display: 'flex', gap: '24px', minHeight: '320px' }">
    <div :style="{ minWidth: '170px' }">
      <h3>scrollPosition</h3>
      <label v-for="item of modes" :key="item" :style="{ display: 'block' }">
        <input v-model="mode" type="radio" :value="item">
        {{ item }}
      </label>
      <label v-if="mode === 'custom'" :style="{ display: 'block' }">
        ratio:
        <input
          v-model.number="customRatio"
          type="number"
          step="0.25"
          min="-1"
          max="2"
          :style="{ width: '56px' }"
        >
      </label>

      <h3>direction</h3>
      <label v-for="item of directions" :key="item" :style="{ display: 'block' }">
        <input v-model="direction" type="radio" :value="item">
        {{ item }}
      </label>

      <h3>tabPosition</h3>
      <label v-for="item of positions" :key="item" :style="{ display: 'block' }">
        <input v-model="tabPosition" type="radio" :value="item">
        {{ item }}
      </label>

      <h3>activeKey</h3>
      <button
        v-for="item of shortcuts"
        :key="item.key"
        type="button"
        @click="activeKey = item.key"
      >
        {{ item.label }}
      </button>
    </div>

    <div :dir="direction" :style="{ flex: 1, maxWidth: '360px' }">
      <Tabs
        :active-key="activeKey"
        :items="items"
        :scroll-position="scrollPosition"
        :direction="direction"
        :tab-position="tabPosition"
        :style="{ maxHeight: '160px' }"
        :on-change="(key: string) => { activeKey = key }"
      />
    </div>
  </div>
</template>
