<script setup lang="ts">
import VirtualList from '../src'

interface Item {
  id: number
  height: number
}

const data: Item[] = []
for (let i = 0; i < 100; i += 1) {
  data.push({
    id: i,
    height: 30 + (i % 2 ? 20 : 0),
  })
}
</script>

<template>
  <div>
    <h2>Not Data</h2>
    <VirtualList
      :data="null"
      :item-height="30"
      :height="100"
      item-key="id"
      :style="{
        border: '1px solid red',
        boxSizing: 'border-box',
      }"
    >
      <template #default="{ item }">
        <span
          :style="{
            border: '1px solid gray',
            padding: '0 16px',
            height: `${item.height}px`,
            lineHeight: '30px',
            boxSizing: 'border-box',
            display: 'inline-block',
          }"
        >
          {{ item.id }}
        </span>
      </template>
    </VirtualList>

    <h2>Less Count</h2>
    <VirtualList
      :data="data.slice(0, 1)"
      :item-height="30"
      :height="100"
      item-key="id"
      :style="{
        border: '1px solid red',
        boxSizing: 'border-box',
      }"
    >
      <template #default="{ item }">
        <span
          :style="{
            border: '1px solid gray',
            padding: '0 16px',
            height: `${item.height}px`,
            lineHeight: '30px',
            boxSizing: 'border-box',
            display: 'inline-block',
          }"
        >
          {{ item.id }}
        </span>
      </template>
    </VirtualList>

    <h2>Less Item Height</h2>
    <VirtualList
      :data="data.slice(0, 10)"
      :item-height="1"
      :height="100"
      item-key="id"
      :style="{
        border: '1px solid red',
        boxSizing: 'border-box',
      }"
    >
      <template #default="{ item }">
        <span
          :style="{
            border: '1px solid gray',
            padding: '0 16px',
            height: `${item.height}px`,
            lineHeight: '30px',
            boxSizing: 'border-box',
            display: 'inline-block',
          }"
        >
          {{ item.id }}
        </span>
      </template>
    </VirtualList>

    <h2>Without Height</h2>
    <VirtualList
      :data="data"
      :item-height="30"
      item-key="id"
      :style="{
        border: '1px solid red',
        boxSizing: 'border-box',
      }"
    >
      <template #default="{ item }">
        <span
          :style="{
            border: '1px solid gray',
            padding: '0 16px',
            height: `${item.height}px`,
            lineHeight: '30px',
            boxSizing: 'border-box',
            display: 'inline-block',
          }"
        >
          {{ item.id }}
        </span>
      </template>
    </VirtualList>
  </div>
</template>
