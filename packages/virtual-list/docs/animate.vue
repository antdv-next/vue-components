<script setup lang="ts">
import type { ListRef } from '../src'
import { ref } from 'vue'
import VirtualList from '../src'
import './animate.less'

interface Item {
  id: string
  uuid: number
}

let uuid = 0
function genItem(): Item {
  const item = {
    id: `key_${uuid}`,
    uuid,
  }
  uuid += 1
  return item
}

const originData: Item[] = []
for (let i = 0; i < 1000; i += 1) {
  originData.push(genItem())
}

const data = ref([...originData])
const closeMap = ref<Record<string, boolean>>({})
const animating = ref(false)
const insertIndex = ref<number>()

const listRef = ref<ListRef>()

function onClose(id: string) {
  closeMap.value = {
    ...closeMap.value,
    [id]: true,
  }
}

function onLeave(id: string) {
  data.value = data.value.filter(item => item.id !== id)
}

function onAppear(...args: any[]) {
  console.log('Appear:', args)
  animating.value = false
}

function lockForAnimation() {
  animating.value = true
}

function onInsertBefore(id: string) {
  const index = data.value.findIndex(item => item.id === id)
  const newData = [...data.value.slice(0, index), genItem(), ...data.value.slice(index)]
  insertIndex.value = index
  data.value = newData
  lockForAnimation()
}

function onInsertAfter(id: string) {
  const index = data.value.findIndex(item => item.id === id) + 1
  const newData = [...data.value.slice(0, index), genItem(), ...data.value.slice(index)]
  insertIndex.value = index
  data.value = newData
  lockForAnimation()
}

function getCurrentHeight(el: Element) {
  const node = el as HTMLElement
  node.style.height = `${node.offsetHeight}px`
  node.style.opacity = '1'
}

function getMaxHeight(el: Element) {
  const node = el as HTMLElement
  node.style.height = `${node.scrollHeight}px`
  node.style.opacity = '1'
}

function getCollapsedHeight(el: Element) {
  const node = el as HTMLElement
  node.style.height = '0'
  node.style.opacity = '0'
}

function resetHeight(el: Element) {
  const node = el as HTMLElement
  node.style.height = ''
  node.style.opacity = ''
  onAppear()
}
</script>

<template>
  <div>
    <h2>Animate</h2>
    <p>Current: {{ data.length }} records</p>

    <VirtualList
      ref="listRef"
      :data="data"
      data-id="list"
      :height="200"
      :item-height="20"
      item-key="id"
      :style="{
        border: '1px solid red',
        boxSizing: 'border-box',
      }"
    >
      <template #default="{ item, index }">
        <Transition
          name="motion"
          :appear="animating && insertIndex === index"
          @before-enter="getCollapsedHeight"
          @enter="getMaxHeight"
          @after-enter="resetHeight"
          @before-leave="getCurrentHeight"
          @leave="getCollapsedHeight"
          @after-leave="() => onLeave(item.id)"
        >
          <div
            v-if="!(closeMap as any)[item.id]"
            class="item"
            :data-id="item.id"
          >
            <div :style="{ height: item.uuid % 2 ? '100px' : undefined }">
              <button type="button" @click="onClose(item.id)">
                Close
              </button>
              <button type="button" @click="onInsertBefore(item.id)">
                Insert Before
              </button>
              <button type="button" @click="onInsertAfter(item.id)">
                Insert After
              </button>
              {{ item.id }}
            </div>
          </div>
        </Transition>
      </template>
    </VirtualList>
  </div>
</template>

<style scoped>
.motion-enter-active,
.motion-leave-active {
  transition: all 0.3s;
}

.motion-enter-from,
.motion-leave-to {
  height: 0;
  opacity: 0;
}
</style>
