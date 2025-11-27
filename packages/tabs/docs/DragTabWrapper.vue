<script setup lang="ts">
import RenderComponent from '@v-c/util/dist/RenderComponent'

defineProps<{
  node: any
  tabKey: string
  onDragStart: (key: string, e: DragEvent) => void
  onDrop: (key: string, e: DragEvent) => void
  onDragEnd?: () => void
}>()
</script>

<template>
  <div
    draggable="true"
    @dragstart="(e: DragEvent) => { onDragStart(tabKey, e); e.dataTransfer?.setData('text/plain', tabKey) }"
    @dragover.prevent
    @drop="(e: DragEvent) => { onDrop(tabKey, e) }"
    @dragend="() => { onDragEnd?.() }"
  >
    <RenderComponent :render="node" />
  </div>
</template>
