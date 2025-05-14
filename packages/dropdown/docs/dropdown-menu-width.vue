<script setup lang="ts">
import { ref } from 'vue'
import Dropdown from '../src'
import MockMenu from './mock-menu.vue'

const longList = ref(false)
function short() {
  longList.value = false
}
function long() {
  longList.value = true
}
</script>

<template>
  <div>
    <Dropdown>
      <button>Actions</button>
      <template #overlay>
        <MockMenu />
      </template>
    </Dropdown>
    <button @click="long">
      Long List
    </button>
    <button @click="short">
      Short List
    </button>
  </div>
</template>

<style scoped>

</style>
