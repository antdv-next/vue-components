<script setup lang="ts">
import type { VNodeArrayChildren } from 'vue'
import type { ExtraContentProps, TabBarExtraMap } from '../interface'
import RenderComponent from '@v-c/util/dist/RenderComponent'
import { ensureValidVNode } from '@v-c/util/dist/vnode'
import { computed, isVNode, ref, toRefs } from 'vue'

const props = defineProps<ExtraContentProps>()

const { position, prefixCls, extra } = toRefs(props)

const extraContentRef = ref<HTMLDivElement>()

const isValidExtra = computed(() => {
  if (typeof extra.value === 'object' && isVNode(extra.value) && ensureValidVNode(Array.isArray(extra.value) ? extra.value : [extra.value] as unknown as VNodeArrayChildren))
    return true

  if (['string', 'number', 'boolean', 'object'].includes(typeof extra.value))
    return true

  return false
})

const childrenNodes = computed(() => {
  if (!extra.value)
    return null

  let assertExtra: TabBarExtraMap = {}
  // React.isValidElement replace isVNode
  if (typeof extra.value === 'object' && !isVNode(extra.value)
  ) {
    assertExtra = extra.value as TabBarExtraMap
  }
  else {
    assertExtra.right = extra.value
  }

  return position.value === 'right' ? assertExtra.right : assertExtra.left
})

defineExpose({
  extraContentRef,
})
</script>

<template>
  <div v-if="isValidExtra" ref="extraContentRef" :class="[`${prefixCls}-extra-content`]">
    <RenderComponent :render="childrenNodes" />
  </div>
</template>
