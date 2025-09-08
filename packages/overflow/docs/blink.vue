<script setup lang="ts">
import type { CSSProperties } from 'vue'
import Overflow from '../src'

const overflowSharedStyle: CSSProperties = {
  background: 'rgba(0, 255, 0, 0.1)',
}

interface ItemType {
  value: string | number
  label: string
}

function createData(count: number): ItemType[] {
  const data: ItemType[] = Array.from({ length: count }).fill(undefined).map((_, index) => ({
    value: index,
    label: `Label ${index}`,
  }))

  return data
}

const sharedStyle: CSSProperties = {
  padding: '4px 8px',
  width: 90,
  overflow: 'hidden',
  background: 'rgba(255, 0, 0, 0.2)',
}

const data = createData(5)
const data2 = createData(2)
</script>

<template>
  <div style="padding: 32px">
    <p>
      Test for a edge case that rest can not decide the final display count
    </p>
    <div
      style="border: 10px solid green;
    margin-top: 32px;
    display: inline-block;"
    >
      <Overflow
        :data="data"
        style="width: 300px"
        :style="overflowSharedStyle"
        max-count="responsive"
      >
        <template #renderItem="item">
          <div :style="sharedStyle">
            {{ item.label }}
          </div>
        </template>
        <template #renderRest="items">
          <template v-if="items.length < 3">
            {{ items.length }}
          </template>
          <template v-else>
            <div :style="sharedStyle">
              +{{ items.length }}...
            </div>
          </template>
        </template>
      </Overflow>

      <Overflow
        :data="data2"
        style="width: 180px"
        :style="overflowSharedStyle"
        max-count="responsive"
      >
        <template #renderItem="item">
          <div :style="sharedStyle">
            {{ item.label }}
          </div>
        </template>
        <template #renderRest="items">
          <template v-if="items.length < 3">
            {{ items.length }}
          </template>
          <template v-else>
            <div :style="sharedStyle">
              +{{ items.length }}...
            </div>
          </template>
        </template>
      </Overflow>
    </div>
  </div>
</template>

<style scoped>

</style>
