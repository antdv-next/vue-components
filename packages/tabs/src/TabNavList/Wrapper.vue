<script setup lang="ts">
import type { TabNavListWrapperProps } from '../interface'
import RenderComponent from '@v-c/util/dist/RenderComponent'
import { computed, h } from 'vue'
import TabNavList from './index.vue'

defineOptions({
  name: 'TabNavListWrapper',
  inheritAttrs: false,
})

const props = defineProps<TabNavListWrapperProps>()

const renderNode = computed(() => {
  const restProps = { ...props }
  delete (restProps as any).renderTabBar

  if (props.renderTabBar) {
    return props.renderTabBar(restProps, TabNavList)
  }

  return h(TabNavList, restProps)
})
</script>

<template>
  <RenderComponent :render="renderNode" />
</template>
