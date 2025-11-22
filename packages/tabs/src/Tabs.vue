<script setup lang="ts">
import type { TabsProps } from './interface'
import useMergedState from '@v-c/util/dist/hooks/useMergedState'
import isMobile from '@v-c/util/dist/isMobile'
import { computed, onMounted, ref, toRefs, watch } from 'vue'
import useAnimateConfig from './hooks/useAnimateConfig'
import { getUUid, setUUid } from './utils'
import omit from '@v-c/util/dist/omit'
import { provideTabContext } from './TabContext'

defineOptions({
  name: 'Tabs',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TabsProps>(), {
  prefixCls: 'vc-tabs',
  tabPosition: 'top',
})

const { id, items, direction, defaultActiveKey, tabPosition, editable, locale, tabBarGutter, more, animated, styles, prefixCls, className, activeKey, tabBarStyle, tabBarExtraContent, destroyOnHidden, renderTabBar, onChange, onTabClick, onTabScroll, getPopupContainer, popupClassName, indicator, classNames: tabsClassNames } = toRefs(props)


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
const [mergedActiveKey, setMergedActiveKey] = useMergedState(defaultKey.value, {
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
const [mergedId, setMergedId] = useMergedState<string | null>(null, {
  // @ts-expect-error: `toRef`
  value: id.value,
})

// Async generate id to avoid ssr mapping failed
onMounted(() => {
  const uuid = getUUid()
  setMergedId(`rc-tabs-${process.env.NODE_ENV === 'test' ? 'test' : uuid}`)
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
  id: mergedId.value,
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
    style: tabBarStyle.value,
    getPopupContainer: getPopupContainer.value,
    popupClassName: [popupClassName.value, tabsClassNames.value?.popup],
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
  <div ref="tabRef" :id="id" :class="[prefixCls,
    `${prefixCls}-${tabPosition}`,
    {
      [`${prefixCls}-mobile`]: mobile,
      [`${prefixCls}-editable`]: editable,
      [`${prefixCls}-rtl`]: rtl,
    },
    className]" v-bind="restProps">

    <TabNavListWrapper v-bind="tabNavBarProps" :renderTabBar="renderTabBar" />
    <TabPanelList :destroyOnHidden="destroyOnHidden" v-bind="sharedProps" :contentStyle="styles?.content"
      :contentClassName="tabsClassNames?.content" :animated="mergedAnimated" />
  </div>
</template>
