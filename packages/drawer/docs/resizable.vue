<script setup lang="ts">
import type { Placement } from '../src/Drawer'
import { computed, ref } from 'vue'
import Drawer from '../src'
import motionProps from './assets/motion'

const open = ref(false)
const placement = ref<Placement>('right')
const width = ref(320)
const height = ref(240)

const buttons = [
  { placement: 'left', label: 'Left Drawer' },
  { placement: 'right', label: 'Right Drawer' },
  { placement: 'top', label: 'Top Drawer' },
  { placement: 'bottom', label: 'Bottom Drawer' },
] as const

const isHorizontal = computed(() => placement.value === 'left' || placement.value === 'right')

function openDrawer(direction: Placement) {
  placement.value = direction
  open.value = true
}

function handleResize(size: number) {
  if (isHorizontal.value) {
    width.value = size
  }
  else {
    height.value = size
  }
}
</script>

<template>
  <div>
    <div class="button-row">
      <button
        v-for="item in buttons"
        :key="item.placement"
        class="trigger"
        @click="() => openDrawer(item.placement as Placement)"
      >
        {{ item.label }}
      </button>
    </div>
    <Drawer
      :width="isHorizontal ? width : undefined"
      :height="!isHorizontal ? height : undefined"
      :placement="placement"
      :open="open"
      :resizable="{
        onResize: handleResize,
        onResizeStart: () => console.log('onResizeStart'),
        onResizeEnd: () => console.log('onResizeEnd'),
      }"
      v-bind="motionProps"
      @close="() => (open = false)"
    >
      <div class="content">
        Resizable Drawer ({{ placement }}) / {{ isHorizontal ? `${width}px` : `${height}px` }}
      </div>
    </Drawer>
  </div>
</template>

<style scoped>
.button-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.trigger {
  padding: 8px 12px;
}

.content {
  padding: 16px;
}
</style>
