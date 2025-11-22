<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { AnimatedConfig, Tab, TabPosition } from '../interface'
import RenderComponent from '@v-c/util/dist/RenderComponent.vue'
import { getTransitionProps } from '@v-c/util/dist/utils/transition'
import { computed, toRefs } from 'vue'
import { useTabContext } from '../TabContext'
import TabPane from './TabPane.vue'

interface TabPanelListProps {
  activeKey: string
  id: string
  animated?: AnimatedConfig
  tabPosition?: TabPosition
  destroyOnHidden?: boolean
  contentStyle?: CSSProperties
  contentClassName?: string
}

const props = defineProps<TabPanelListProps>()
const { id, activeKey, animated, tabPosition, destroyOnHidden, contentStyle, contentClassName } = toRefs(props)

const ctx = useTabContext()
const tabs = computed<Tab[]>(() => ctx?.value.tabs || [])
const prefixCls = computed(() => ctx?.value.prefixCls || '')

const tabPaneAnimated = computed(() => animated.value?.tabPane === true)
const tabPanePrefixCls = computed(() => `${prefixCls.value}-tabpane`)
const transitionProps = computed(() => {
  if (!tabPaneAnimated.value)
    return {}

  if (animated.value?.tabPaneMotion)
    return animated.value.tabPaneMotion
  return getTransitionProps(tabPanePrefixCls.value)
})

function shouldDestroyOnHidden(item: Tab) {
  return !!(!item.forceRender && ((destroyOnHidden.value ?? item.destroyOnHidden) === true))
}
</script>

<template>
  <div :class="[`${prefixCls}-content-holder`]">
    <div
      :class="[`${prefixCls}-content`, `${prefixCls}-content-${tabPosition}`, { [`${prefixCls}-content-animated`]: tabPaneAnimated }]"
    >
      <template v-for="item in tabs" :key="item.key">
        <Transition v-if="tabPaneAnimated" v-bind="transitionProps">
          <TabPane
            v-if="shouldDestroyOnHidden(item) ? (item.key === activeKey) : true"
            v-show="shouldDestroyOnHidden(item) ? true : (item.key === activeKey || item.forceRender)
            "
            :id="id"
            :prefix-cls="tabPanePrefixCls"
            :tab-key="item.key"
            :animated="tabPaneAnimated"
            :active="item.key === activeKey"
            :style="{ ...(contentStyle || {}), ...(item.style || {}) }"
            :class-name="[contentClassName, item.className, item.key !== activeKey && `${tabPanePrefixCls}-hidden`]"
          >
            <RenderComponent :render="item.children" />
          </TabPane>
        </Transition>
        <TabPane
          v-if="!tabPaneAnimated && (shouldDestroyOnHidden(item) ? (item.key === activeKey) : true)"
          v-show="shouldDestroyOnHidden(item) ? true : (item.key === activeKey || item.forceRender)"
          :id="id"
          :prefix-cls="tabPanePrefixCls"
          :tab-key="item.key"
          :animated="tabPaneAnimated"
          :active="item.key === activeKey"
          :style="{ ...(contentStyle || {}), ...(item.style || {}) }"
          :class-name="[contentClassName, item.className, item.key !== activeKey && `${tabPanePrefixCls}-hidden`]"
        >
          <RenderComponent :render="item.children" />
        </TabPane>
      </template>
    </div>
  </div>
</template>

<style scoped>
</style>
