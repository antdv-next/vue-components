<script setup lang="ts">
import { ref } from 'vue'
import Dropdown from '../src'
import MockMenu from './mock-menu.vue'

const visible = ref(false)
const selected = ref([])
function onVisibleChange(data: boolean) {
  console.log('visible', data)
  visible.value = data
}
function saveSelected({ selectedKeys }) {
  selected.value = selectedKeys
}
function confirm() {
  console.log('confirm', visible.value)
  visible.value = false
}
</script>

<template>
  <Dropdown
    :visible="visible"
    :trigger="['click']"
    :close-on-select="false"
    animation="slide-up"
    @visible-change="onVisibleChange"
  >
    <button>open</button>
    <template #overlay>
      <MockMenu>
        <button @click="confirm">
          确定
        </button>
      </MockMenu>
    </template>
  </Dropdown>
</template>

<style scoped>

</style>
