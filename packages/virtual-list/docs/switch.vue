<script setup lang="ts">
import type { ListRef } from '../src'
import { ref } from 'vue'
import VirtualList from '../src'

interface Item {
  id: number
}

function getData(count: number): Item[] {
  const result: Item[] = []
  for (let i = 0; i < count; i += 1) {
    result.push({ id: i })
  }
  return result
}

const height = ref(200)
const data = ref(getData(20))
const fullHeight = ref(true)
const listRef = ref<ListRef>()

function setDataCount(count: number) {
  data.value = getData(count)
}

function showScrollbar() {
  listRef.value?.scrollTo(null)
}
</script>

<template>
  <div style="height: 150vh">
    <h2>Switch</h2>
    <div style="margin-bottom: 16px">
      <span>
        Data:
        <label><input type="radio" name="data" value="0" @change="() => setDataCount(0)"> 0</label>
        <label><input type="radio" name="data" value="2" @change="() => setDataCount(2)"> 2</label>
        <label><input type="radio" name="data" value="20" checked @change="() => setDataCount(20)"> 20</label>
        <label><input type="radio" name="data" value="100" @change="() => setDataCount(100)"> 100</label>
        <label><input type="radio" name="data" value="200" @change="() => setDataCount(200)"> 200</label>
        <label><input type="radio" name="data" value="1000" @change="() => setDataCount(1000)"> 1000</label>
        <label><input type="radio" name="data" value="100000" @change="() => setDataCount(100000)"> 100000</label>
        <label><input type="radio" name="data" value="50000" @change="() => setDataCount(50000)"> 50000</label>
        <button type="button" @click="showScrollbar">
          Show scrollbar
        </button>
      </span>
      <br>
      <span>
        Height:
        <label><input type="radio" name="height" value="0" @change="() => height = 0"> 0</label>
        <label><input type="radio" name="height" value="100" @change="() => height = 100"> 100</label>
        <label><input type="radio" name="height" value="200" checked @change="() => height = 200"> 200</label>
      </span>
      <span style="margin-left: 16px">
        <button @click="fullHeight = !fullHeight">
          Full Height: {{ fullHeight }}
        </button>
      </span>
    </div>

    <VirtualList
      ref="listRef"
      :data="data"
      :height="height"
      :item-height="10"
      item-key="id"
      :full-height="fullHeight"
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
            height: '30px',
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

<style scoped>
label {
  margin-left: 8px;
}

button {
  margin-left: 8px;
  padding: 4px 8px;
  cursor: pointer;
}
</style>
