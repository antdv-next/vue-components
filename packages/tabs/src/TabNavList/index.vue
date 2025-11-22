<script setup lang="ts">
import type { CSSProperties, Ref } from 'vue'
import type { SizeInfo, Tab, TabNavListProps } from '../interface'
import ResizeObserver from '@v-c/resize-observer'
import RenderComponent from '@v-c/util/dist/RenderComponent.vue'
import { computed, h, nextTick, onMounted, ref, shallowRef, toRefs, watch } from 'vue'
import useOffsets from '../hooks/useOffsets'
import useTouchMove from '../hooks/useTouchMove'
import useVisibleRange from '../hooks/useVisibleRange'
import { useTabContext } from '../TabContext'
import { genDataNodeKey } from '../utils'
import AddButton from './AddButton.vue'
import ExtraContent from './ExtraContent.vue'
import OperationNode from './OperationNode.vue'
import TabNode from './TabNode.vue'
import useIndicator from '../hooks/useIndicator'


defineOptions({
  name: 'TabNavList',
  inheritAttrs: false
})

const props = defineProps<TabNavListProps>()

const {
  className,
  style,
  id,
  animated,
  activeKey,
  rtl,
  extra,
  editable,
  locale,
  tabPosition,
  tabBarGutter,
  children,
  onTabClick,
  onTabScroll,
  indicator,
  classNames: tabsClassNames,
  styles,
  mobile,
  more,
  getPopupContainer,
  popupClassName,
} = toRefs(props)

// const { tabs, prefixCls } = toRefs(useTabContext()?.value || {})
const ctx = useTabContext()
const tabs = computed(() => ctx?.value.tabs || [])
const prefixCls = computed(() => ctx?.value.prefixCls || '')

const containerRef = ref<HTMLDivElement | null>(null)
const extraLeftRef = ref<HTMLDivElement | null>(null)
const extraRightRef = ref<HTMLDivElement | null>(null)
const tabsWrapperRef = ref<HTMLDivElement | null>(null)
const tabListRef = ref<HTMLDivElement | null>(null)

const tabPositionTopOrBottom = computed(() => tabPosition.value === 'top' || tabPosition.value === 'bottom')

const transformLeft = ref(0)
const transformTop = ref(0)

watch(transformLeft, (next, prev) => {
  if (tabPositionTopOrBottom.value && onTabScroll) {
    props.onTabScroll?.({ direction: next > (prev || 0) ? 'left' : 'right' })
  }
}, { immediate: true })

watch(transformTop, (next, prev) => {
  if (!tabPositionTopOrBottom.value && onTabScroll) {
    props.onTabScroll?.({ direction: next > (prev || 0) ? 'top' : 'bottom' })
  }
}, { immediate: true })

const containerExcludeExtraSize = ref<SizeInfo>([0, 0])
const tabContentSize = ref<SizeInfo>([0, 0])
const firstTabContentSize = computed(() => tabContentSize.value[0])
const addSize = ref<SizeInfo>([0, 0])
const operationSize = ref<SizeInfo>([0, 0])

const tabSizes = shallowRef(new Map())
const tabOffsets = useOffsets(tabs, tabSizes, firstTabContentSize)
const operationsRef = ref<any>(null)
const innerAddButtonRef = ref<HTMLButtonElement | null>(null)

/**
 * Convert `SizeInfo` to unit value. Such as [123, 456] with `top` position get `123`
 */
function getUnitValue(size: SizeInfo, tabPositionTopOrBottom: boolean) {
  return size[tabPositionTopOrBottom ? 0 : 1]
}

// ========================== Unit =========================
const containerExcludeExtraSizeValue = computed(() => getUnitValue(
  containerExcludeExtraSize.value,
  tabPositionTopOrBottom.value,
))

const tabContentSizeValue = computed(() => getUnitValue(tabContentSize.value, tabPositionTopOrBottom.value))
const addSizeValue = computed(() => getUnitValue(addSize.value, tabPositionTopOrBottom.value))
const operationSizeValue = computed(() => getUnitValue(operationSize.value, tabPositionTopOrBottom.value))

const needScroll
  = computed(() => Math.floor(containerExcludeExtraSizeValue.value) < Math.floor(tabContentSizeValue.value + addSizeValue.value))
const visibleTabContentValue = computed(() => needScroll.value
  ? containerExcludeExtraSizeValue.value - operationSizeValue.value
  : containerExcludeExtraSizeValue.value - addSizeValue.value)
// ========================== Util =========================
const operationsHiddenClassName = computed(() => `${prefixCls.value}-nav-operations-hidden`)

const transformComputed = computed(() => {
  let transformMin = 0
  let transformMax = 0

  if (!tabPositionTopOrBottom.value) {
    transformMin = Math.min(0, visibleTabContentValue.value - tabContentSizeValue.value)
    transformMax = 0
  }
  else if (rtl.value) {
    transformMin = 0
    transformMax = Math.max(0, tabContentSizeValue.value - visibleTabContentValue.value)
  }
  else {
    transformMin = Math.min(0, visibleTabContentValue.value - tabContentSizeValue.value)
    transformMax = 0
  }
  return {
    transformMin,
    transformMax,
  }
})

function alignInRange(value: number): number {
  const { transformMin, transformMax } = transformComputed.value
  if (value < transformMin) {
    return transformMin
  }
  if (value > transformMax) {
    return transformMax
  }
  return value
}

// ========================= Mobile ========================
const touchMovingRef = ref<ReturnType<typeof setTimeout> | null>(null)

const lockAnimation = ref<number>()
function doLockAnimation() {
  lockAnimation.value = Date.now()
}

function clearTouchMoving() {
  if (touchMovingRef.value) {
    clearTimeout(touchMovingRef.value)
  }
}

useTouchMove(tabsWrapperRef, (offsetX, offsetY) => {
  function doMove(dataRef: Ref<number>, offset: number) {
    dataRef.value = alignInRange(dataRef.value + offset)
  }

  // Skip scroll if place is enough
  if (!needScroll.value) {
    return false
  }

  if (tabPositionTopOrBottom.value) {
    doMove(transformLeft, offsetX)
  }
  else {
    doMove(transformTop, offsetY)
  }

  clearTouchMoving()
  doLockAnimation()

  return true
})

onMounted(() => {
  watch(() => lockAnimation.value, () => {
    clearTouchMoving()
    if (lockAnimation.value) {
      touchMovingRef.value = setTimeout(() => {
        lockAnimation.value = 0
      }, 100)
    }

    return clearTouchMoving
  }, { immediate: true })
})
// ===================== Visible Range =====================
const visibleRangeRef = useVisibleRange(
  tabOffsets,
  // Container
  visibleTabContentValue,
  // Transform
  computed(() => (tabPositionTopOrBottom.value ? transformLeft.value : transformTop.value)),
  // Tabs
  tabContentSizeValue,
  // Add
  addSizeValue,
  // Operation
  operationSizeValue,
  { tabs, tabPosition, rtl },
)
const visibleStart = computed(() => visibleRangeRef.value[0])
const visibleEnd = computed(() => visibleRangeRef.value[1])
const hiddenTabs = computed(() => {
  const startHidden = tabs.value.slice(0, visibleStart.value)
  const endHidden = tabs.value.slice(visibleEnd.value + 1)
  return [...startHidden, ...endHidden]
})
const hasDropdown = computed(() => hiddenTabs.value.length > 0)
const wrapPrefix = computed(() => `${prefixCls.value}-nav-wrap`)
const pingLeft = computed(() => tabPositionTopOrBottom.value ? (rtl.value ? transformLeft.value > 0 : transformLeft.value < 0) : false)
const pingRight = computed(() => {
  if (!tabPositionTopOrBottom.value)
    return false
  if (rtl.value)
    return transformLeft.value !== transformComputed.value.transformMax
  return transformLeft.value !== transformComputed.value.transformMin
})
const pingTop = computed(() => (!tabPositionTopOrBottom.value ? transformTop.value < 0 : false))
const pingBottom = computed(() => (!tabPositionTopOrBottom.value ? transformTop.value !== transformComputed.value.transformMin : false))

// ========================= Scroll ========================
function scrollToTab(key = activeKey.value) {
  const tabOffset = tabOffsets.value.get(key) || {
    width: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
  }

  if (tabPositionTopOrBottom.value) {
    // ============ Align with top & bottom ============
    const newTransform = transformLeft

    // RTL
    if (rtl.value) {
      if (tabOffset.right < transformLeft.value) {
        newTransform.value = tabOffset.right
      }
      else if (tabOffset.right + tabOffset.width > transformLeft.value + visibleTabContentValue.value) {
        newTransform.value = tabOffset.right + tabOffset.width - visibleTabContentValue.value
      }
    }
    // LTR
    else if (tabOffset.left < -transformLeft.value) {
      newTransform.value = -tabOffset.left
    }
    else if (tabOffset.left + tabOffset.width > -transformLeft.value + visibleTabContentValue.value) {
      newTransform.value = -(tabOffset.left + tabOffset.width - visibleTabContentValue.value)
    }

    // setTransformTop(0);
    transformTop.value = 0
    transformLeft.value = alignInRange(newTransform.value)
  }
  else {
    // ============ Align with left & right ============
    const newTransform = transformTop

    if (tabOffset.top < -transformTop.value) {
      newTransform.value = -tabOffset.top
    }
    else if (tabOffset.top + tabOffset.height > -transformTop.value + visibleTabContentValue.value) {
      newTransform.value = -(tabOffset.top + tabOffset.height - visibleTabContentValue.value)
    }

    transformLeft.value = 0
    transformTop.value = alignInRange(newTransform.value)
  }
}

// ========================= Focus =========================
const focusKey = ref<string | undefined>()
const isMouse = ref(false)

const enabledTabs = computed(() => tabs.value.filter(tab => !tab.disabled).map(tab => tab.key))

function onOffset(offset: number) {
  const enabledKeys = getEnabledKeys(tabs.value)
  const currentIndex = enabledKeys.indexOf(focusKey.value || activeKey.value)
  const len = enabledKeys.length
  const nextIndex = (currentIndex + offset + len) % len
  focusKey.value = enabledKeys[nextIndex]
}

function handleRemoveTab(removalKey: string | undefined, e: MouseEvent | KeyboardEvent) {
  if (!removalKey)
    return
  const removeTab = tabs.value.find(t => t.key === removalKey)
  const removable = removeTab && !removeTab.disabled && (removeTab.closable || editable.value)
  if (removable) {
    e.preventDefault()
    e.stopPropagation()
    editable.value?.onEdit('remove', { key: removalKey, event: e as any })
    const enabledKeys = getEnabledKeys(tabs.value)
    const removeIndex = enabledKeys.indexOf(removalKey)
    if (removeIndex === enabledKeys.length - 1)
      onOffset(-1)
    else onOffset(1)
  }
}

function handleMouseDown(key: string, e: MouseEvent) {
  isMouse.value = true
  if (e.button === 1)
    handleRemoveTab(key, e)
}

function handleKeyDown(e: KeyboardEvent) {
  const { code } = e

  const isRTL = rtl.value && tabPositionTopOrBottom.value
  const firstEnabledTab = enabledTabs.value[0]
  const lastEnabledTab = enabledTabs.value[enabledTabs.value.length - 1]

  switch (code) {
    // LEFT
    case 'ArrowLeft': {
      if (tabPositionTopOrBottom.value) {
        onOffset(isRTL ? 1 : -1)
      }
      break
    }

    // RIGHT
    case 'ArrowRight': {
      if (tabPositionTopOrBottom.value) {
        onOffset(isRTL ? -1 : 1)
      }
      break
    }

    // UP
    case 'ArrowUp': {
      e.preventDefault()
      if (!tabPositionTopOrBottom.value) {
        onOffset(-1)
      }
      break
    }

    // DOWN
    case 'ArrowDown': {
      e.preventDefault()
      if (!tabPositionTopOrBottom.value) {
        onOffset(1)
      }
      break
    }

    // HOME
    case 'Home': {
      e.preventDefault()
      focusKey.value = firstEnabledTab
      break
    }

    // END
    case 'End': {
      e.preventDefault()
      focusKey.value = lastEnabledTab
      break
    }

    // Enter & Space
    case 'Enter':
    case 'Space': {
      e.preventDefault()
      props.onTabClick?.(focusKey.value ?? activeKey.value, e)
      break
    }
    // Backspace
    case 'Backspace':
    case 'Delete': {
      handleRemoveTab(focusKey.value, e)
      break
    }
  }
}

const isHorizontal = computed(() => tabPositionTopOrBottom.value)
const navClass = computed(() => [
  `${prefixCls.value}-nav`,
  className.value,
  tabsClassNames.value?.header,
])
const navStyle = computed(() => ({
  ...(styles.value?.header || {}),
  ...(style.value || {}),
}))
const navListClass = computed(() => `${prefixCls.value}-nav-list`)


function onItemClick(key: string, e: MouseEvent | KeyboardEvent) {
  onTabClick.value?.(key, e as any)
}

function getEnabledKeys(list: Tab[]) {
  return list.filter(t => !t.disabled).map(t => t.key)
}

function onItemBlur() {
  focusKey.value = undefined
}

function onTabFocus(key: string) {
  if (!isMouse.value) {
    focusKey.value = key
  }
  scrollToTab(key)
  doLockAnimation()
  const wrap = tabsWrapperRef.value
  if (!wrap)
    return
  if (!rtl.value)
    wrap.scrollLeft = 0
  wrap.scrollTop = 0
}

const activeTabOffset = computed(() => tabOffsets.value.get(activeKey.value)!)

const inkStyle = useIndicator({
    activeTabOffset: activeTabOffset,
    horizontal: isHorizontal,
    indicator: indicator,
    rtl: rtl,
  })

  watch(() => inkStyle.value, (newStyle) => {
    console.log('newValue styles',newStyle, inkStyle.value)

  })
// ========================== Measure ==========================
function getTabSize(tab: HTMLElement, containerRect: { left: number, top: number }) {
  const { offsetWidth, offsetHeight, offsetTop, offsetLeft } = tab
  const { width, height, left, top } = tab.getBoundingClientRect()
  if (Math.abs(width - offsetWidth) < 1)
    return [width, height, left - containerRect.left, top - containerRect.top]
  return [offsetWidth, offsetHeight, offsetLeft, offsetTop]
}

function getSize(refObj: Ref<HTMLElement | null>) {
  const el = refObj.value
  const { offsetWidth = 0, offsetHeight = 0 } = el || {}
  if (el) {
    const { width, height } = el.getBoundingClientRect()
    if (Math.abs(width - offsetWidth) < 1)
      return [width, height]
  }
  return [offsetWidth, offsetHeight]
}

function updateTabSizes() {
  tabSizes.value = (() => {
    const newSizes = new Map<string, { width: number, height: number, left: number, top: number }>()
    const listRect = tabListRef.value?.getBoundingClientRect?.()
    tabs.value.forEach(({ key }) => {
      const listEl = tabListRef.value
      const btnNode = listEl?.querySelector?.(
        `[data-node-key="${genDataNodeKey(key)}"]`,
      ) as HTMLElement | null
      if (btnNode && listRect) {
        const [width, height, left, top] = getTabSize(btnNode, listRect as any)
        newSizes.set(key, { width, height, left, top })
      }
    })
    return newSizes
  })()
}

function onListHolderResize() {
  const containerSize = getSize(containerRef)
  const extraLeftEl = (extraLeftRef.value as any)?.extraContentRef as HTMLElement | null
  const extraRightEl = (extraRightRef.value as any)?.extraContentRef as HTMLElement | null
  const extraLeftSize = extraLeftEl ? getSize({ value: extraLeftEl } as any) : [0, 0]
  const extraRightSize = extraRightEl ? getSize({ value: extraRightEl } as any) : [0, 0]
  containerExcludeExtraSize.value = [
    containerSize[0] - extraLeftSize[0] - extraRightSize[0],
    containerSize[1] - extraLeftSize[1] - extraRightSize[1],
  ]

  const opEl = operationsRef.value?.operationNodeRef as HTMLElement | null
  operationSize.value = opEl ? getSize({ value: opEl } as any) as any : [0, 0]

  const tabListEl = tabListRef.value
  const tabContentFullSize = tabListEl ? getSize({ value: tabListEl } as any) : [0, 0]
  const addEl = (innerAddButtonRef.value as any)?.buttonRef as HTMLElement | null
  addSize.value = addEl ? getSize({ value: addEl } as any) as any : [0, 0]
  tabContentSize.value = [
    tabContentFullSize[0] - addSize.value[0],
    tabContentFullSize[1] - addSize.value[1],
  ]

  updateTabSizes()
}

watch(() => tabs.value.map(t => t.key).join('_'), () => {
  updateTabSizes()
})

watch([activeKey, () => transformComputed.value.transformMin, () => transformComputed.value.transformMax, visibleTabContentValue, tabOffsets], () => {
  scrollToTab()
})

watch(rtl, () => {
  onListHolderResize()
})
</script>

<template>
  <ResizeObserver @resize="onListHolderResize">
    <div ref="containerRef" :class="navClass" :style="navStyle" role="tablist"
      :aria-orientation="isHorizontal ? 'horizontal' : 'vertical'" @keydown="() => {
        doLockAnimation()
      }">
      <ExtraContent ref="extraLeftRef" position="left" :prefix-cls="prefixCls" :extra="extra" />
      <ResizeObserver @resize="onListHolderResize">
        <div ref="tabsWrapperRef" :class="[
          wrapPrefix,
          {
            [`${wrapPrefix}-ping-left`]: pingLeft,
            [`${wrapPrefix}-ping-right`]: pingRight,
            [`${wrapPrefix}-ping-top`]: pingTop,
            [`${wrapPrefix}-ping-bottom`]: pingBottom,
          },
        ]">
          <ResizeObserver @resize="onListHolderResize">
            <div ref="tabListRef" :class="navListClass" :style="{
              transform: `translate(${transformLeft}px, ${transformTop}px)`,
              transition: lockAnimation ? 'none' : undefined,
            }">
              <RenderComponent :render="tabs.map((tab, i) => h(TabNode, {
                id,
                prefixCls,
                key: tab.key,
                tab,
                className: tabsClassNames?.item,
                style: i === 0 ? styles?.item : { ...(isHorizontal ? { marginInlineStart: tabBarGutter } : { marginTop: tabBarGutter }), ...(styles?.item || {}) },
                closable: tab.closable,
                editable,
                active: tab.key === activeKey,
                focus: tab.key === focusKey,
                renderWrapper: children,
                removeAriaLabel: locale?.removeAriaLabel,
                tabCount: tabs.filter(t => !t.disabled).length,
                currentPosition: i + 1,
                onClick: (e: MouseEvent | KeyboardEvent) => onItemClick(tab.key, e),
                onKeyDown: handleKeyDown,
                onFocus: () => onTabFocus(tab.key),
                onBlur: () => onItemBlur(),
                onMouseDown: (e: MouseEvent) => handleMouseDown(tab.key, e),
                onMouseUp: () => { isMouse = false },
              }))" />
              <AddButton ref="innerAddButtonRef" :prefix-cls="prefixCls" :locale="locale" :editable="editable" :style="{
                ...(tabs.length === 0 ? {} : (isHorizontal ? { marginInlineStart: tabBarGutter } : { marginTop: tabBarGutter })),
                visibility: hasDropdown ? 'hidden' : null,
              } as CSSProperties" />

              <div :class="[
                `${prefixCls}-ink-bar`,
                tabsClassNames?.indicator,
                { [`${prefixCls}-ink-bar-animated`]: animated?.inkBar },
              ]" :style="{ ...(styles?.indicator || {}), ...inkStyle }" />
            </div>
          </ResizeObserver>
        </div>
      </ResizeObserver>

      <OperationNode ref="operationsRef" :remove-aria-label="locale?.removeAriaLabel" :prefix-cls="prefixCls"
        :tabs="hiddenTabs"
        :class-name="[tabsClassNames?.operations, !hasDropdown ? operationsHiddenClassName : undefined]"
        :popup-style="styles?.popup" :tab-moving="!!lockAnimation"
        v-bind="{ id, rtl, tabBarGutter, activeKey, mobile, more, editable, locale, onTabClick, getPopupContainer, popupClassName }" />

      <ExtraContent ref="extraRightRef" position="right" :prefix-cls="prefixCls" :extra="extra" />
      <RenderComponent :render="children" />
    </div>
  </ResizeObserver>
</template>
