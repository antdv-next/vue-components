<script setup lang="ts">
import type { TabsProps } from './interface'
import useMergedState from '@v-c/util/dist/hooks/useMergedState'
import isMobile from '@v-c/util/dist/isMobile'
import omit from '@v-c/util/dist/omit'
import { clsx } from '@v-c/util'
import { computed, onMounted, ref, toRefs, watch } from 'vue'
import useAnimateConfig from './hooks/useAnimateConfig'
import { provideTabContext } from './TabContext'
import TabPanelList from './TabPanelList/index.vue'
import TabNavListWrapper from './TabNavList/Wrapper.vue';
import { getUUid, setUUid } from './utils'

defineOptions({
  name: 'Tabs',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TabsProps>(), {
  prefixCls: 'vc-tabs',
  tabPosition: 'top',
  animated: undefined,
  destroyOnHidden: undefined
})

const { id, items, direction, defaultActiveKey, tabPosition, editable, locale, tabBarGutter, more, animated, styles, prefixCls, className, activeKey, tabBarStyle, tabBarExtraContent, destroyOnHidden, renderTabBar, onChange, onTabClick, onTabScroll, getPopupContainer, popupClassName, indicator, classNames: tabsClassNames } = toRefs(props)

console.log(props, 'tabs')
const restProps = computed(() => {
  return omit(props, [
    'id',
    'prefixCls',
    'className',
    'items',
    'direction',
    'activeKey',
    'defaultActiveKey',
    'editable',
    'animated',
    'tabPosition',
    'tabBarGutter',
    'tabBarStyle',
    'tabBarExtraContent',
    'locale',
    'more',
    'destroyOnHidden',
    'renderTabBar',
    'onChange',
    'onTabClick',
    'onTabScroll',
    'getPopupContainer',
    'popupClassName',
    'indicator',
    'classNames',
    'styles',
  ])
})

const tabs = computed(() => (items.value || []).filter(item => item && typeof item === 'object' && 'key' in item))

const rtl = computed(() => direction.value === 'rtl')

// FIXME:
const mergedAnimated = computed(() => useAnimateConfig(animated.value))
// ======================== Mobile ========================
const mobile = ref(false)
onMounted(() => {
  mobile.value = isMobile()
})

// ====================== Active Key ======================
const defaultKey = computed(() => defaultActiveKey.value ?? tabs.value[0]?.key)
const [mergedActiveKey, setMergedActiveKey] = useMergedState('', {
  defaultValue:activeKey.value ?? defaultKey.value,
  // @ts-expect-error: `toRef`
  value: activeKey.value,
})

const activeIndex = ref(tabs.value.findIndex(item => item.key === mergedActiveKey.value))

const tabKeyStr = computed(() => tabs.value.map(tab => tab.key).join('_'))

onMounted(() => {
  watch([tabKeyStr, mergedActiveKey, activeIndex], () => {
    activeIndex.value = tabs.value.findIndex(item => item.key === mergedActiveKey.value)
    let newActiveIndex = tabs.value.findIndex(tab => tab.key === mergedActiveKey.value)
    if (newActiveIndex === -1) {
      newActiveIndex = Math.max(0, Math.min(activeIndex.value, tabs.value.length - 1))
      setMergedActiveKey(tabs.value[newActiveIndex]?.key)
    }
    activeIndex.value = newActiveIndex
  }, { immediate: true })
})

// ===================== Accessibility ====================
const [mergedId, setMergedId] = useMergedState(null as string | null, {
  // @ts-expect-error: `toRef`
  value: id.value,
})

// Async generate id to avoid ssr mapping failed
onMounted(() => {
  const uuid = getUUid()
  setMergedId(`vc-tabs-${process.env.NODE_ENV === 'test' ? 'test' : uuid}`)
  setUUid(uuid + 1)
})

// ======================== Events ========================
function onInternalTabClick(key: string, e: MouseEvent | KeyboardEvent) {
  onTabClick.value?.(key, e)
  const isActiveChanged = key !== mergedActiveKey.value
  setMergedActiveKey(key)
  if (isActiveChanged) {
    onChange.value?.(key)
  }
}

// ======================== Render ========================
const sharedProps = computed(() => ({
  id: mergedId.value as string,
  activeKey: mergedActiveKey.value,
  animated: mergedAnimated.value,
  tabPosition: tabPosition.value,
  rtl: rtl.value,
  mobile: mobile.value,
}))

const tabNavBarProps = computed(() => {
  return {
    ...sharedProps.value,
    editable: editable.value,
    locale: locale.value,
    more: more.value,
    tabBarGutter: tabBarGutter.value,
    onTabClick: onInternalTabClick,
    onTabScroll: onTabScroll.value,
    extra: tabBarExtraContent.value,
    style: tabBarStyle.value!,
    getPopupContainer: getPopupContainer.value,
    popupClassName: clsx([popupClassName.value, tabsClassNames.value?.popup]),
    indicator: indicator.value,
    styles: styles.value,
    classNames: tabsClassNames.value,
  }
})

const memoizedValue = computed(() => {
  return { tabs: tabs.value, prefixCls: prefixCls.value }
})

const tabRef = ref<HTMLDivElement>()

provideTabContext(memoizedValue)
</script>

<template>
  <div
    :id="id" ref="tabRef" :class="[prefixCls,
                                   `${prefixCls}-${tabPosition}`,
                                   {
                                     [`${prefixCls}-mobile`]: mobile,
                                     [`${prefixCls}-editable`]: editable,
                                     [`${prefixCls}-rtl`]: rtl,
                                   },
                                   className]" v-bind="restProps"
  >
    <TabNavListWrapper
    v-bind="tabNavBarProps"
    :render-tab-bar="renderTabBar!" />
    <TabPanelList
      :destroy-on-hidden="destroyOnHidden" v-bind="sharedProps" :content-style="styles?.content"
      :content-class-name="tabsClassNames?.content" :animated="mergedAnimated"
    />
  </div>
</template>
