<script setup lang="ts">
import { ref } from 'vue'
import Drawer from '../src'
import motionProps from './assets/motion'
import GetContainerFalse from './get-container-false.vue'

const containerRef = ref<HTMLDivElement | null>(null)
const open = ref(false)

function setOpen(value: boolean) {
  open.value = value
}
</script>

<template>
  <div>
    <div id="container" ref="containerRef" class="demo-container">
      <button @click="() => setOpen(true)">
        Open
      </button>
    </div>
    <Drawer
      width="20vw"
      :get-container="() => containerRef?.value"
      :open="open"
      v-bind="motionProps"
      @close="() => setOpen(false)"
    >
      <div class="content">
        <div class="menu-title">
          Navigation
        </div>
        <ul class="menu">
          <li>Option 1</li>
          <li>Option 2</li>
          <li>Option 3</li>
          <li>Option 4</li>
          <li>Option 5</li>
        </ul>
      </div>
    </Drawer>
  </div>
  <hr>
  <GetContainerFalse />
</template>

<style scoped>
.demo-container {
  padding: 12px;
  border: 1px dashed #999;
  margin-bottom: 12px;
}
.content {
  padding: 20px;
}
.menu-title {
  margin-bottom: 8px;
  font-weight: 600;
}
.menu {
  list-style: none;
  padding: 0;
  margin: 0;
}
.menu li {
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
}
</style>
