<script setup lang="ts">
import type { ListRef } from '../src'
import { ref } from 'vue'
import VirtualList from '../src'

interface Item {
  id: number
}

const data: Item[] = []
for (let i = 0; i < 100000; i += 1) {
  data.push({ id: i })
}

const listRef = ref<ListRef>()

function scrollToShowBar() {
  listRef.value?.scrollTo(null)
}

function scrollTo100px() {
  listRef.value?.scrollTo(500)
}

function scrollToLarge() {
  listRef.value?.scrollTo({
    index: 99999999,
    align: 'top',
  })
}

function scrollTo50Top() {
  listRef.value?.scrollTo({
    index: 50,
    align: 'top',
  })
}

function scrollTo50Bottom() {
  listRef.value?.scrollTo({
    index: 50,
    align: 'bottom',
  })
}

function scrollTo50Auto() {
  listRef.value?.scrollTo({
    index: 50,
    align: 'auto',
  })
}

function scrollTo50TopOffset() {
  listRef.value?.scrollTo({
    index: 50,
    align: 'top',
    offset: 15,
  })
}

function scrollTo50BottomOffset() {
  listRef.value?.scrollTo({
    index: 50,
    align: 'bottom',
    offset: 15,
  })
}

function scrollToKey50() {
  listRef.value?.scrollTo({
    key: 50,
    align: 'auto',
  })
}

function scrollToLast() {
  listRef.value?.scrollTo({
    index: data.length - 2,
    align: 'top',
  })
}

function scrollToFirst() {
  listRef.value?.scrollTo({
    index: 0,
    align: 'bottom',
  })
}

const visible = ref(true)

function onScroll(e: Event) {
  const target = e.currentTarget as HTMLElement
  console.log('scroll:', target.scrollTop)
}
</script>

<template>
  <div style="height: 200vh">
    <h2>Basic</h2>
    <div style="margin-bottom: 16px">
      <button type="button" style="margin: 4px" @click="scrollToShowBar">
        Show scroll bar
      </button>
      <button type="button" style="margin: 4px" @click="scrollTo100px">
        Scroll To 100px
      </button>
      <button type="button" style="margin: 4px" @click="scrollToLarge">
        Scroll To 99999999 (top)
      </button>
      <button type="button" style="margin: 4px" @click="scrollTo50Top">
        Scroll To 50 (top)
      </button>
      <button type="button" style="margin: 4px" @click="scrollTo50Bottom">
        Scroll To 50 (bottom)
      </button>
      <button type="button" style="margin: 4px" @click="scrollTo50Auto">
        Scroll To 50 (auto)
      </button>
      <br>
      <button type="button" style="margin: 4px" @click="scrollTo50TopOffset">
        Scroll To 50 (top) + 15 offset
      </button>
      <button type="button" style="margin: 4px" @click="scrollTo50BottomOffset">
        Scroll To 50 (bottom) + 15 offset
      </button>
      <button type="button" style="margin: 4px" @click="scrollToKey50">
        Scroll To key 50 (auto)
      </button>
      <button type="button" style="margin: 4px" @click="scrollToLast">
        Scroll To Last (top)
      </button>
      <button type="button" style="margin: 4px" @click="scrollToFirst">
        Scroll To First (bottom)
      </button>
      <button type="button" style="margin: 4px" @click="visible = !visible">
        Toggle visible
      </button>
    </div>

    <VirtualList
      ref="listRef"
      :data="data"
      :height="200"
      :item-height="20"
      item-key="id"
      :style="{
        border: '1px solid red',
        boxSizing: 'border-box',
        display: visible ? '' : 'none',
      }"
      @scroll="onScroll"
    >
      <template #default="{ item }">
        <span
          :style="{
            height: `${30 + (item.id % 2 ? 0 : 10)}px`,
            lineHeight: '30px',
            display: 'inline-block',
            padding: '0 8px',
          }"
          @click="() => console.log('Click:', item.id)"
        >
          {{ item.id }}
        </span>
      </template>
    </VirtualList>
  </div>
</template>

<style scoped>
button {
  padding: 4px 8px;
  cursor: pointer;
}
</style>
