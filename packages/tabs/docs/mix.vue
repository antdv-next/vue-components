<script setup lang="ts">
import type { TabsProps } from '../src'
import { ref } from 'vue'
import Tabs from '../src'
import '../assets/index.less'

function getTabPanes(count = 50) {
  const items: NonNullable<TabsProps['items']> = []
  for (let i = 0; i < count; i += 1) {
    items.push({
      key: String(i),
      label: `Tab ${i}`,
      disabled: i === 3,
      closable: i === 5 ? false : undefined,
      children: `Content of ${i}`,
    })
  }
  return items
}

const activeKey = ref<string | undefined>()
const position = ref<'left' | 'right' | 'top' | 'bottom'>('top')
const gutter = ref(false)
const fixHeight = ref(true)
const rtl = ref(false)
const editable = ref(true)
const destroyOnHidden = ref(false)
const destroy = ref(false)
const animated = ref(true)
const tabPanes = ref(getTabPanes(10))

const editableConfig = {
  onEdit: (
    type: 'add' | 'remove',
    info: { key?: string, event: MouseEvent | KeyboardEvent },
  ) => {
    if (type === 'remove') {
      tabPanes.value = tabPanes.value.filter(tab => tab.key !== info.key)
    }
    else {
      const lastTab = tabPanes.value[tabPanes.value.length - 1]
      const num = Number(lastTab?.key ?? -1) + 1
      tabPanes.value = [
        ...tabPanes.value,
        { key: String(num), label: `Tab ${num}`, children: `Content of ${num}` },
      ]
    }
  },
}
</script>

<template>
  <div :style="{ minHeight: '2000px' }">
    <div>
      <label>
        <input v-model="gutter" type="checkbox">
        Set `tabBarGutter`
      </label>

      <label>
        <input v-model="animated" type="checkbox">
        Set `animated.tabPane`
      </label>

      <label>
        <input v-model="fixHeight" type="checkbox">
        Set fixed height
      </label>

      <label>
        <input v-model="editable" type="checkbox">
        Set Editable
      </label>

      <label>
        <input v-model="destroyOnHidden" type="checkbox">
        Destroy Inactive TabPane
      </label>

      <label>
        <input v-model="rtl" type="checkbox">
        Set `direction=rtl`
      </label>

      <button
        type="button"
        @click="() => {
          const counts = [50, 10, 0]
          const idx = counts.indexOf(tabPanes.length)
          const count = counts[(idx + 1) % counts.length]
          tabPanes = getTabPanes(count)
        }"
      >
        Change TabPanes
      </button>

      <button
        type="button"
        @click="() => {
          const target = tabPanes[Math.floor(tabPanes.length * Math.random())]
          if (target) {
            activeKey = String(target.key)
            console.log('Random Key:', target.key)
          }
        }"
      >
        Active Random
      </button>

      <select v-model="position">
        <option value="left">
          left
        </option>
        <option value="right">
          right
        </option>
        <option value="top">
          top
        </option>
        <option value="bottom">
          bottom
        </option>
      </select>

      <button type="button" @click="() => { destroy = !destroy }">
        Destroy
      </button>
    </div>

    <Tabs
      v-if="!destroy"
      :active-key="activeKey"
      :on-change="(key: string) => { if (activeKey !== undefined) activeKey = key }"
      :on-tab-scroll="(info) => { console.log('Scroll:', info) }"
      :destroy-on-hidden="destroyOnHidden"
      :animated="{ tabPane: animated }"
      :editable="editable ? editableConfig : undefined"
      :direction="rtl ? 'rtl' : undefined"
      :tab-position="position"
      :tab-bar-gutter="gutter ? 32 : undefined"
      tab-bar-extra-content="extra"
      default-active-key="30"
      :style="{ height: fixHeight ? '300px' : undefined }"
      :items="tabPanes"
    />
  </div>
</template>
