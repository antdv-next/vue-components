<script setup lang="ts">
import type { TabPaneProps } from '../interface'
import RenderComponent from '@v-c/util/dist/RenderComponent'
import { ensureValidVNode } from '@v-c/util/dist/vnode'
import { useSlots } from 'vue'

defineOptions({
  name: 'TabPane',
  inheritAttrs: false,
})

defineProps<TabPaneProps>()

const slots = useSlots()
// Slots are updated independently of reactive dependencies; read the current
// slot during rendering instead of caching its VNodes in a computed.
const childrenNode = () => ensureValidVNode(slots.default?.() || [])
</script>

<template>
  <div
    :id="id ? `${id}-panel-${tabKey}` : undefined"
    role="tabpanel"
    :tabindex="active && childrenNode()?.length ? 0 : -1"
    :aria-labelledby="id ? `${id}-tab-${tabKey}` : undefined"
    :aria-hidden="!active"
    :style="style"
    :class="[prefixCls, active && `${prefixCls}-active`, className]"
  >
    <RenderComponent :render="childrenNode()" />
  </div>
</template>
