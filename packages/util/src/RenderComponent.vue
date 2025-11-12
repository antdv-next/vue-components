<script setup lang="ts">
import type { VueNode } from '@v-c/util/dist/type'
import { computed } from 'vue'

defineOptions({
  name: 'RenderComponent',
  inheritAttrs: false,
})

const props = defineProps<Props>()
interface Props {
  render: VueNode[] | VueNode
}

const isPrimitiveRender = computed(() => {
  const render = props.render
  return (
    typeof render === 'string'
    || typeof render === 'number'
    || typeof render === 'boolean'
  )
})
</script>

<template>
  <template v-if="Array.isArray(render)">
    <component :is="item" v-for="(item, index) in render" :key="index" v-bind="$attrs" />
  </template>

  <template v-else-if="isPrimitiveRender">
    {{ render }}
  </template>

  <component :is="render" v-else v-bind="$attrs" />
</template>
