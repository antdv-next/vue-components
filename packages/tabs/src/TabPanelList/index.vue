<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { AnimatedConfig, Tab, TabPosition } from '../interface'
import RenderComponent from '@v-c/util/dist/RenderComponent'
import { getTransitionProps } from '@v-c/util/dist/utils/transition'
import { computed, reactive, toRefs, watch } from 'vue'
import { useTabContext } from '../TabContext'
import TabPane from './TabPane.vue'

interface TabPanelListProps {
  activeKey: string
  id: string | null
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
// rc-tabs 1.11.0 semantic rename: each pane is now `${prefixCls}-content`
// (was `${prefixCls}-tabpane`); the inner wrapper became `${prefixCls}-body`.
const tabPanePrefixCls = computed(() => `${prefixCls.value}-content`)
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

// Track which panes have ever been active, mirroring rc-motion's `renderedRef`:
// once a pane has been visible it stays mounted (keep-alive) unless destroyed.
const visitedKeys = reactive(new Set<string>())
watch(
  activeKey,
  (key) => {
    if (key != null)
      visitedKeys.add(key)
  },
  { immediate: true },
)

// Decide whether a pane's content is mounted, replicating CSSMotion (STATUS_NONE,
// leavedClassName always truthy):
//   active                          -> mounted
//   forceRender                     -> mounted (forceRender wins over destroy)
//   destroyOnHidden && inactive     -> unmounted
//   visited before (keep-alive)     -> mounted
//   never visited (lazy)            -> unmounted
function shouldRender(item: Tab) {
  if (item.key === activeKey.value)
    return true
  if (item.forceRender)
    return true
  if ((destroyOnHidden.value ?? item.destroyOnHidden) === true)
    return false
  return visitedKeys.has(item.key)
}
</script>

<template>
  <div :class="[`${prefixCls}-body-holder`]">
    <div
      :class="[
        `${prefixCls}-body`,
        `${prefixCls}-body-${tabPosition}`,
        { [`${prefixCls}-body-animated`]: tabPaneAnimated }]
      "
    >
      <template v-for="item in tabs" :key="item.key">
        <Transition v-if="tabPaneAnimated" v-bind="transitionProps">
          <TabPane
            v-if="shouldRender(item)"
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
        </Transition>
        <TabPane
          v-if="!tabPaneAnimated && shouldRender(item)"
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
