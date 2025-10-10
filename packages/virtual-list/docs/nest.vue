<script setup lang="ts">
import VirtualList from '../src'

interface Item {
  id: number
}

const data: Item[] = []
for (let i = 0; i < 100; i += 1) {
  data.push({ id: i })
}

function onScroll(e: Event) {
  // console.log('scroll:', (e.currentTarget as HTMLElement).scrollTop)
}
</script>

<template>
  <div>
    <h2>Nested List</h2>
    <VirtualList
      :data="data"
      :height="800"
      :item-height="20"
      item-key="id"
      :style="{
        border: '1px solid red',
        boxSizing: 'border-box',
      }"
      @scroll="onScroll"
    >
      <template #default="{ item }">
        <div :style="{ padding: '20px', background: 'yellow' }">
          <VirtualList
            :data="data"
            :height="200"
            :item-height="20"
            item-key="id"
            :style="{
              border: '1px solid blue',
              boxSizing: 'border-box',
              background: 'white',
            }"
          >
            <template #default="{ item: innerItem, index }">
              <div
                :style="{
                  height: '20px',
                  border: '1px solid cyan',
                }"
              >
                {{ item.id }}-{{ index }}
              </div>
            </template>
          </VirtualList>
        </div>
      </template>
    </VirtualList>
  </div>
</template>
