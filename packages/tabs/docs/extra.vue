<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Tabs from '../src/index'

const items = Array.from({ length: 50 }).map((_, i) => ({
  key: String(i),
  label: `Tab ${i}`,
  children: `Content of ${i}`,
}))

type P = 'left' | 'right'

type Content<T> = Record<'default' | P, T>

const content: Content<string> = {
  default: 'default',
  left: 'left',
  right: 'right',
}

const isDefault = ref(true)
const position = ref<P[]>([])
const checkRef = ref<HTMLInputElement | null>(null)

const extra = computed(() => {
  if (isDefault.value)
    return content.default

  if (position.value.length === 0)
    return undefined

  return position.value.reduce((acc: Record<P, any>, cur: P) => {
    acc[cur] = content[cur]
    return acc
  }, {} as Record<P, any>)
})

function setBothSide() {
  if (position.value.length < 2)
    position.value = ['left', 'right']
}

function handleCheck(pos: P) {
  const add = !position.value.includes(pos)
  position.value = add ? [...position.value, pos] : position.value.filter(item => item !== pos)
}

const overall = computed(() => {
  if (position.value.length === 0) {
    return { checked: false, indeterminate: false }
  }
  if (position.value.length === 2) {
    return { checked: true, indeterminate: false }
  }
  return { checked: false, indeterminate: true }
})

watch(overall, (val) => {
  if (checkRef.value)
    checkRef.value.indeterminate = val.indeterminate
})

watch(isDefault, (val) => {
  if (val)
    position.value = []
})

watch(position, (pos) => {
  if (pos.length > 0)
    isDefault.value = false
})
</script>

<template>
  <div :style="{ maxWidth: '550px' }">
    <Tabs :tab-bar-extra-content="extra" default-active-key="8" :items="items" />
    <div :style="{ display: 'flex' }">
      <div>
        <input
          id="default-position"
          type="radio"
          :checked="isDefault"
          @change="() => { isDefault = true }"
        >
        <label for="default-position">default position(right)</label>
      </div>
      <div :style="{ marginInlineStart: '15px' }">
        <input
          id="coustom-position"
          ref="checkRef"
          :type="overall.indeterminate ? 'checkbox' : 'radio'"
          :checked="overall.checked"
          @change="setBothSide"
        >
        <label for="coustom-position">coustom position</label>
        <ul>
          <li>
            <input
              id="left"
              type="checkbox"
              :checked="position.includes('left')"
              @change="() => { handleCheck('left') }"
            >
            <label for="left">left</label>
          </li>
          <li>
            <input
              id="right"
              type="checkbox"
              :checked="position.includes('right')"
              @change="() => { handleCheck('right') }"
            >
            <label for="right">right</label>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style src="../assets/index.less" lang="less"></style>
