<script setup lang="ts">
import { ref } from 'vue'
import Drawer from '../src'
import motionProps from './assets/motion'

const open = ref(false)

function setOpen(value: boolean) {
  open.value = value
}
</script>

<template>
  <div class="parent-demo">
    <div class="container">
      <div class="inner">
        <button class="open-btn" @click="() => setOpen(true)">
          Open
        </button>
      </div>
    </div>

    <Drawer
      width="20vw"
      :get-container="false"
      placement="right"
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
</template>

<style scoped>
.content {
  padding: 20px;
}

.parent-demo {
  position: relative;
  overflow: hidden;
}

.container {
  height: 300px;
  background: rgba(0, 0, 0, 0.05);
  overflow: auto;
  position: relative;
}

.inner {
  display: inline-block;
  height: 1000px;
  box-shadow: 0 0 1px red;
}

.open-btn {
  height: 100px;
  margin: 12px;
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

.menu-title {
  margin-bottom: 8px;
  font-weight: 600;
}
</style>
