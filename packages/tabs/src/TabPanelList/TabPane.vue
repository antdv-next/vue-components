<script setup lang="ts">
import type { TabPaneProps } from '../interface'
import RenderComponent from '@v-c/util/dist/RenderComponent'
import { ensureValidVNode } from '@v-c/util/dist/vnode'
import { computed, useSlots } from 'vue'

defineOptions({
  name: 'TabPane',
  inheritAttrs: false,
})

defineProps<TabPaneProps>()

const slots = useSlots()
const childrenNode = computed(() => ensureValidVNode(slots.default?.() || []))

const hasContent = computed(() => childrenNode.value && childrenNode.value?.length > 0)
</script>

<template>
  <div
    :id="id ? `${id}-panel-${tabKey}` : undefined"
    role="tabpanel"
    :tabindex="active && hasContent ? 0 : -1"
    :aria-labelledby="id ? `${id}-tab-${tabKey}` : undefined"
    :aria-hidden="!active"
    :style="style"
    :class="[prefixCls, active && `${prefixCls}-active`, className]"
  >
    <RenderComponent :render="childrenNode" />
  </div>
</template>
