<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import Menu from '../../src'
import Children1 from './children1.vue'
import Children2 from './children2.vue'
import './menu.less'

defineProps<{
  mode: string
  defaultMotions: object
  triggerSubMenuAction?: any
  updateChildrenAndOverflowedIndicator?: boolean
  direction?: string
}>()

const overflowedIndicator = ref<string | undefined>(undefined)

const child = shallowRef({
  component: Children1,
})

function toggleChildren() {
  child.value = child.value.component === Children1 ? { component: Children2 } : { component: Children1 }
}
function toggleOverflowedIndicator() {
  overflowedIndicator.value = overflowedIndicator.value ? undefined : `<span>Add More Items</span>`
}
function handleClick(info) {
  console.log(`clicked ${info.key}`)
  console.log(info)
}
function onOpenChange(value) {
  console.log('onOpenChange', value)
}
</script>

<template>
  <div v-show="updateChildrenAndOverflowedIndicator">
    <button type="button" @click="toggleChildren">
      toggle children
    </button>
    <button type="button" @click="toggleOverflowedIndicator">
      toggle overflowedIndicator
    </button>
  </div>
  <Menu
    :trigger-sub-menu-action="triggerSubMenuAction"
    :selected-keys="['3']"
    v-bind="$props"
    @open-change="onOpenChange"
    @click="handleClick"
  >
    <template #overflowedIndicator>
      <div v-if="overflowedIndicator">
        <span>Add More Items</span>
      </div>
    </template>
    <component :is="child.component" />
  </Menu>
</template>

<style scoped>

</style>
