<script setup lang="ts">
import { ref } from 'vue'
import Drawer from '../src'
import motionProps from './assets/motion.ts'

const open = ref(false)

function onClose() {
  open.value = false
}

function onToggle() {
  open.value = !open.value
}
</script>

<template>
  <div>
    <Drawer
      v-model:open="open"
      placement="right"
      width="60%"
      v-bind="motionProps"
      @close="onClose"
      @after-open-change="(c) => {
        console.log('transitionEnd: ', c);
      }"
    >
      content
    </Drawer>
    <div>
      <button @click="onToggle">
        打开
      </button>
    </div>
  </div>
</template>

<style scoped>

</style>
