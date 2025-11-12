<script setup lang="ts">
import type { VNodeArrayChildren } from 'vue'
import type { ExtraContentProps, TabBarExtraMap } from '../interface'
import RenderComponent from '@v-c/util/dist/RenderComponent.vue'
import { ensureValidVNode } from '@v-c/util/dist/vnode'
import { computed, isVNode, ref, toRefs } from 'vue'

const props = withDefaults(defineProps<ExtraContentProps>(), {})

const { position, prefixCls, extra } = toRefs(props)

const extraContentRef = ref<HTMLDivElement>()

const isValidExtra = computed(() => ensureValidVNode(extra.value as VNodeArrayChildren))

const childrenNodes = computed(() => {
  if (!extra.value)
    return null

  let assertExtra: TabBarExtraMap = {}
  const internalExtra = Array.isArray(extra.value) ? extra.value : [extra.value]
  // React.isValidElement replace isVNode && ensureValidVNode
  if (typeof extra.value === 'object' && isVNode(internalExtra) && ensureValidVNode(internalExtra as VNodeArrayChildren)) {
    assertExtra = extra.value as TabBarExtraMap
  }
  else {
    assertExtra.right = extra
  }

  return position.value === 'right' ? assertExtra.right : assertExtra.left
})

const isValidChildrenNodes = computed(() => ensureValidVNode(childrenNodes.value as VNodeArrayChildren))
</script>

<template>
  <div v-if="isValidExtra && isValidChildrenNodes" ref="extraContentRef" :class="[`${prefixCls}-extra-content`]">
    <RenderComponent :render="childrenNodes" />
  </div>
</template>
