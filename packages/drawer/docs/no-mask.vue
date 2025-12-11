<script setup lang="ts">
import { ref } from 'vue'
import Drawer from '../src'
import motionProps from './assets/motion'

const open = ref(true)

function onSwitch() {
  open.value = !open.value
}
</script>

<template>
  <div>
    <div
      style="
        width: 100%;
        height: 667px;
        background: #fff000;
        color: #fff;
        text-align: center;
        line-height: 667px;
      "
    >
      内容区块
      <button
        style="
          height: 24px;
          width: 100px;
          margin-left: 20px;
          color: #000;
          line-height: 24px;
        "
        @click="onSwitch"
      >
        {{ !open ? '打开' : '关闭' }}
      </button>
    </div>

    <Drawer
      width="250px"
      :mask="false"
      :open="open"
      placement="right"
      v-bind="motionProps"
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
          <li>Option 6</li>
          <li>Option 7</li>
          <li>Option 8</li>
        </ul>
      </div>
    </Drawer>
  </div>
</template>

<style scoped>
.content {
  padding: 20px;
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
