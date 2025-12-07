import type { Key } from '@v-c/util/dist/type'

import type { CSSProperties, PropType, VNode } from 'vue'
import type { InnerProps } from './Filler'
import type { ExtraRenderInfo } from './interface'
import type { ScrollBarDirectionType, ScrollBarRef } from './ScrollBar'
import ResizeObserver from '@v-c/resize-observer'
import { pureAttrs } from '@v-c/util/dist/props-util'
import { computed, defineComponent, ref, shallowRef, toRaw, toRef, watch } from 'vue'
import Filler from './Filler'
import useDiffItem from './hooks/useDiffItem'
import useFrameWheel from './hooks/useFrameWheel'
import { useGetSize } from './hooks/useGetSize'
import useHeights from './hooks/useHeights'
import useMobileTouchMove from './hooks/useMobileTouchMove'
import useScrollDrag from './hooks/useScrollDrag'
import useScrollTo from './hooks/useScrollTo'
import Item from './Item'
import ScrollBar from './ScrollBar'
import { getSpinSize } from './utils/scrollbarUtil'

const EMPTY_DATA: any[] = []

const ScrollStyle: CSSProperties = {
  overflowY: 'auto',
  overflowAnchor: 'none',
}

export interface ScrollInfo {
  x: number
  y: number
}

export type ScrollTo = (arg?: number | ScrollConfig | null) => void

export interface ListRef {
  nativeElement?: HTMLDivElement
  scrollTo: ScrollTo
  getScrollInfo: () => ScrollInfo
}

export interface ScrollPos {
  left?: number
  top?: number
}

export interface ScrollTarget {
  index?: number
  key?: Key
  align?: 'top' | 'bottom' | 'auto'
  offset?: number
}

export type ScrollConfig = ScrollTarget | ScrollPos

export interface ListProps {
  prefixCls?: string
  data?: any[]
  height?: number
  itemHeight?: number
  fullHeight?: boolean
  itemKey: Key | ((item: any) => Key)
  component?: string
  virtual?: boolean
  direction?: ScrollBarDirectionType
  /**
   * By default `scrollWidth` is same as container.
   * When set this, it will show the horizontal scrollbar and
   * `scrollWidth` will be used as the real width instead of container width.
   * When set, `virtual` will always be enabled.
   */
  scrollWidth?: number
  styles?: {
    horizontalScrollBar?: CSSProperties
    horizontalScrollBarThumb?: CSSProperties
    verticalScrollBar?: CSSProperties
    verticalScrollBarThumb?: CSSProperties
  }
  showScrollBar?: boolean | 'optional'
  onScroll?: (e: Event) => void
  onVirtualScroll?: (info: ScrollInfo) => void
  onVisibleChange?: (visibleList: any[], fullList: any[]) => void
  innerProps?: InnerProps
  extraRender?: (info: ExtraRenderInfo) => VNode
}

export default defineComponent({
  name: 'VirtualList',
  props: {
    prefixCls: { type: String, default: 'vc-virtual-list' },
    data: { type: Array as PropType<any[]> },
    height: Number,
    itemHeight: Number,
    fullHeight: { type: Boolean, default: true },
    itemKey: { type: [String, Number, Function] as PropType<Key | ((item: any) => Key)>, required: true },
    component: { type: String, default: 'div' },
    direction: { type: String as PropType<ScrollBarDirectionType> },
    scrollWidth: Number,
    styles: Object,
    showScrollBar: { type: [Boolean, String] as PropType<boolean | 'optional'>, default: 'optional' },
    virtual: { type: Boolean, default: true },
    onScroll: Function as PropType<(e: Event) => void>,
    onVirtualScroll: Function as PropType<(info: ScrollInfo) => void>,
    onVisibleChange: Function as PropType<(visibleList: any[], fullList: any[]) => void>,
    innerProps: Object as PropType<InnerProps>,
    extraRender: Function as PropType<(info: ExtraRenderInfo) => VNode>,
  },
  inheritAttrs: false,
  setup(props, { expose, attrs, slots }) {
    const itemHeight = computed(() => props.itemHeight)
    const itemKey = toRef(props, 'itemKey')
    // =============================== Item Key ===============================
    const getKey = (item: any): Key => {
      item = toRaw(item)
      const _itemKey = itemKey.value
      if (typeof _itemKey === 'function') {
        return _itemKey(item)
      }
      return item?.[_itemKey as string]
    }

    // ================================ Height ================================
    const [setInstanceRef, collectHeight, heights, heightUpdatedMark] = useHeights(
      getKey,
      undefined,
      undefined,
    )

    // ================================= MISC =================================
    // const mergedData = computed(() => props.data || EMPTY_DATA)
    const mergedData = shallowRef(props?.data || EMPTY_DATA)
    watch(() => props.data, () => {
      mergedData.value = props?.data || EMPTY_DATA
    })

    const useVirtual = computed(
      () => !!(props.virtual !== false && props.height && props.itemHeight),
    )

    const containerHeight = computed(() =>
      Object.values(heights.maps).reduce((total: number, curr: number) => total + curr, 0),
    )

    const inVirtual = computed(() => {
      const data = mergedData.value
      return (
        useVirtual.value
        && data
        && (Math.max(props.itemHeight! * data.length, containerHeight.value) > props.height!
          || !!props.scrollWidth)
      )
    })

    const componentRef = ref<HTMLDivElement>()
    const fillerInnerRef = ref<HTMLDivElement>()
    const containerRef = ref<HTMLDivElement>()
    const verticalScrollBarRef = shallowRef<ScrollBarRef>()
    const horizontalScrollBarRef = shallowRef<ScrollBarRef>()

    const offsetTop = ref(0)
    const offsetLeft = ref(0)
    const scrollMoving = ref(false)

    // ScrollBar related
    const verticalScrollBarSpinSize = ref(0)
    const horizontalScrollBarSpinSize = ref(0)
    const contentScrollWidth = ref<number>(props.scrollWidth || 0)

    // ========================== Visible Calculation =========================
    const scrollHeight = ref(0)
    const start = ref(0)
    const end = ref(0)
    const fillerOffset = ref<number | undefined>(undefined)

    // ================================ Scroll ================================
    function syncScrollTop(newTop: number | ((prev: number) => number)) {
      let value: number
      if (typeof newTop === 'function') {
        value = newTop(offsetTop.value)
      }
      else {
        value = newTop
      }

      const maxScrollHeight = scrollHeight!.value! - props.height!
      const alignedTop = Math.max(0, Math.min(value, maxScrollHeight || 0))

      if (componentRef.value) {
        componentRef.value.scrollTop = alignedTop
      }
      offsetTop.value = alignedTop
    }

    // ================================ Range ================================

    watch(
      [
        inVirtual,
        useVirtual,
        offsetTop,
        mergedData,
        heightUpdatedMark,
        () => props.height,
      ],
      () => {
        if (!useVirtual.value) {
          scrollHeight.value = 0
          start.value = 0
          end.value = mergedData.value.length - 1
          fillerOffset.value = undefined
          return
        }
        const { itemHeight, height } = props

        if (!inVirtual.value) {
          scrollHeight.value = fillerInnerRef.value?.offsetHeight || 0
          start.value = 0
          end.value = mergedData.value.length - 1
          fillerOffset.value = undefined
          return
        }

        let itemTop = 0
        let startIndex: number | undefined
        let startOffset: number | undefined
        let endIndex: number | undefined

        const dataLen = mergedData.value.length
        const data = toRaw(mergedData.value)

        for (let i = 0; i < dataLen; i += 1) {
          const item = data[i]
          const key = getKey(item)

          const cacheHeight = heights.get(key)
          const currentItemBottom = itemTop + (cacheHeight === undefined ? itemHeight! : cacheHeight)

          if (currentItemBottom >= offsetTop.value && startIndex === undefined) {
            startIndex = i
            startOffset = itemTop
          }

          if (currentItemBottom > offsetTop.value + height! && endIndex === undefined) {
            endIndex = i
          }

          itemTop = currentItemBottom

          if (startIndex !== undefined && endIndex !== undefined) {
            itemTop = currentItemBottom + (dataLen - 1 - i) * itemHeight!
            break
          }
        }

        if (startIndex === undefined) {
          startIndex = 0
          startOffset = 0
          endIndex = Math.ceil(height! / itemHeight!)
        }
        if (endIndex === undefined) {
          endIndex = mergedData.value.length - 1
        }

        endIndex = Math.min(endIndex + 1, mergedData.value.length - 1)

        scrollHeight.value = itemTop
        start.value = startIndex
        end.value = endIndex
        fillerOffset.value = startOffset
      },
      { immediate: true },
    )

    // Sync scroll top when height changes
    watch(
      scrollHeight,
      () => {
        const changedRecord = heights.getRecord()
        if (changedRecord.size === 1) {
          const recordKey = Array.from(changedRecord.keys())[0]
          const prevCacheHeight = changedRecord.get(recordKey)

          const startItem = mergedData.value[start.value]
          if (startItem && prevCacheHeight === undefined) {
            const startIndexKey = getKey(startItem)
            if (startIndexKey === recordKey) {
              const realStartHeight = heights.get(recordKey)
              const diffHeight = realStartHeight - props.itemHeight!
              syncScrollTop(ori => ori + diffHeight)
            }
          }
        }

        heights.resetRecord()
      },
    )

    // ================================= Size =================================
    const size = ref({ width: 0, height: props.height || 0 })

    const onHolderResize = (sizeInfo: { offsetWidth: number, offsetHeight: number }) => {
      size.value = {
        width: sizeInfo.offsetWidth,
        height: sizeInfo.offsetHeight,
      }
      contentScrollWidth.value = props.scrollWidth ?? sizeInfo.offsetWidth
    }

    // =============================== Scroll ===============================
    const isRTL = computed(() => props.direction === 'rtl')

    const getVirtualScrollInfo = () => ({
      x: isRTL.value ? -offsetLeft.value : offsetLeft.value,
      y: offsetTop.value,
    })

    const lastVirtualScrollInfo = ref(getVirtualScrollInfo())

    const triggerScroll = (params?: { x?: number, y?: number }) => {
      if (props.onVirtualScroll) {
        const nextInfo = { ...getVirtualScrollInfo(), ...params }

        if (
          lastVirtualScrollInfo.value.x !== nextInfo.x
          || lastVirtualScrollInfo.value.y !== nextInfo.y
        ) {
          props.onVirtualScroll(nextInfo)
          lastVirtualScrollInfo.value = nextInfo
        }
      }
    }

    // ========================== Scroll Position ===========================
    const horizontalRange = computed(() =>
      Math.max(0, (contentScrollWidth.value || 0) - size.value.width),
    )

    const isScrollAtTop = computed(() => offsetTop.value === 0)
    const isScrollAtBottom = computed(() => offsetTop.value + props.height! >= scrollHeight.value)
    const isScrollAtLeft = computed(() => offsetLeft.value === 0)
    const isScrollAtRight = computed(() => offsetLeft.value >= horizontalRange.value)

    const keepInHorizontalRange = (nextOffsetLeft: number) => {
      const max = horizontalRange.value
      return Math.max(0, Math.min(nextOffsetLeft, max))
    }

    // ========================== Wheel & Touch =========================
    const delayHideScrollBar = () => {
      verticalScrollBarRef.value?.delayHidden()
      horizontalScrollBarRef.value?.delayHidden()
    }

    const [onWheel] = useFrameWheel(
      inVirtual,
      isScrollAtTop,
      isScrollAtBottom,
      isScrollAtLeft,
      isScrollAtRight,
      horizontalRange.value > 0,
      (offsetY, isHorizontal) => {
        if (isHorizontal) {
          const next = isRTL.value ? offsetLeft.value - offsetY : offsetLeft.value + offsetY
          const aligned = keepInHorizontalRange(next)
          offsetLeft.value = aligned
          triggerScroll({ x: isRTL.value ? -aligned : aligned })
        }
        else {
          syncScrollTop(top => top + offsetY)
        }
      },
    )

    useMobileTouchMove(
      inVirtual,
      componentRef,
      (isHorizontal, offset, _smoothOffset, _e) => {
        if (isHorizontal) {
          const next = isRTL.value ? offsetLeft.value - offset : offsetLeft.value + offset
          const aligned = keepInHorizontalRange(next)
          offsetLeft.value = aligned
          triggerScroll({ x: isRTL.value ? -aligned : aligned })
          return true
        }
        else {
          syncScrollTop(top => top + offset)
          return true
        }
      },
    )

    useScrollDrag(
      inVirtual,
      componentRef,
      (offset) => {
        syncScrollTop(top => top + offset)
      },
    )

    // ========================== ScrollBar =========================
    const onScrollBar = (newScrollOffset: number, horizontal?: boolean) => {
      const newOffset = newScrollOffset
      if (horizontal) {
        offsetLeft.value = newOffset
        triggerScroll({ x: isRTL.value ? -newOffset : newOffset })
      }
      else {
        syncScrollTop(newOffset)
      }
    }

    const onScrollbarStartMove = () => {
      scrollMoving.value = true
    }

    const onScrollbarStopMove = () => {
      scrollMoving.value = false
    }

    useDiffItem(mergedData, getKey)

    // Calculate ScrollBar spin size
    watch(
      [() => props.height, scrollHeight, inVirtual, () => size.value.height],
      () => {
        if (inVirtual.value && props.height && scrollHeight.value) {
          verticalScrollBarSpinSize.value = getSpinSize(size.value.height, scrollHeight.value)
        }
      },
      { immediate: true },
    )

    watch(
      [() => size.value.width, () => contentScrollWidth.value],
      () => {
        if (inVirtual.value && contentScrollWidth.value) {
          horizontalScrollBarSpinSize.value = getSpinSize(size.value.width, contentScrollWidth.value)
        }
      },
      { immediate: true },
    )

    watch(
      () => props.scrollWidth,
      (val) => {
        contentScrollWidth.value = val ?? size.value.width
        offsetLeft.value = keepInHorizontalRange(offsetLeft.value)
      },
      { immediate: true },
    )

    function onFallbackScroll(e: Event) {
      const target = e.currentTarget as HTMLDivElement
      const newScrollTop = target.scrollTop
      if (newScrollTop !== offsetTop.value) {
        syncScrollTop(newScrollTop)
      }

      props.onScroll?.(e)
      triggerScroll()
    }

    // ================================= Ref ==================================
    const scrollTo = useScrollTo(
      componentRef as any,
      mergedData,
      heights,
      itemHeight as any,
      getKey,
      () => collectHeight(true),
      syncScrollTop,
      delayHideScrollBar,
    )

    expose({
      nativeElement: containerRef,
      getScrollInfo: getVirtualScrollInfo,
      scrollTo: (config: any) => {
        function isPosScroll(arg: any): arg is ScrollPos {
          return arg && typeof arg === 'object' && ('left' in arg || 'top' in arg)
        }
        if (isPosScroll(config)) {
          if (config.left !== undefined) {
            offsetLeft.value = keepInHorizontalRange(config.left)
          }
          scrollTo(config.top as any)
        }
        else {
          scrollTo(config)
        }
      },
    })

    // ================================ Effect ================================
    watch(
      [start, end, mergedData],
      () => {
        if (props.onVisibleChange) {
          const renderList = mergedData.value.slice(start.value, end.value + 1)
          props.onVisibleChange(renderList, mergedData.value)
        }
      },
    )

    const getSize = useGetSize(mergedData, getKey, heights, itemHeight as any)

    return () => {
      // ================================ Render ================================
      const renderChildren = () => {
        const children: VNode[] = []
        const data = mergedData.value
        const defaultSlot = slots.default

        if (!defaultSlot) {
          return children
        }

        for (let i = start.value; i <= end.value; i += 1) {
          const item = data[i]
          const key = getKey(item)
          // Call the slot function with item, index, and props
          const nodes = defaultSlot({
            item,
            index: i,
            style: {},
            offsetX: offsetLeft.value,
          })

          // Wrap each node in Item component
          const node = Array.isArray(nodes) ? nodes[0] : nodes
          if (node) {
            children.push(
              <Item key={key} setRef={ele => setInstanceRef(item, ele)}>
                {node}
              </Item>,
            )
          }
        }
        return children
      }
      const componentStyle: CSSProperties = {}
      if (props.height) {
        componentStyle[props.fullHeight ? 'height' : 'maxHeight'] = `${props.height}px`
        Object.assign(componentStyle, ScrollStyle)

        if (useVirtual.value) {
          componentStyle.overflowY = 'hidden'

          if (horizontalRange.value > 0) {
            componentStyle.overflowX = 'hidden'
          }

          if (scrollMoving.value) {
            componentStyle.pointerEvents = 'none'
          }
        }
      }

      const extraContent = props.extraRender?.({
        start: start.value,
        end: end.value,
        virtual: inVirtual.value,
        offsetX: offsetLeft.value,
        offsetY: fillerOffset.value || 0,
        rtl: isRTL.value,
        getSize: getSize.value,
      })

      const Component = props.component as any

      return (
        <div
          ref={containerRef}
          {...pureAttrs(attrs)}
          style={{ position: 'relative', ...(attrs.style as CSSProperties) }}
          dir={isRTL.value ? 'rtl' : undefined}
          class={[
            props.prefixCls,
            { [`${props.prefixCls}-rtl`]: isRTL.value },
            attrs.class,
          ]}
        >
          <ResizeObserver onResize={onHolderResize}>
            <Component
              class={`${props.prefixCls}-holder`}
              style={componentStyle}
              ref={componentRef}
              onScroll={onFallbackScroll}
              onWheel={onWheel}
              onMouseenter={delayHideScrollBar}
            >
              <Filler
                prefixCls={props.prefixCls}
                height={scrollHeight.value}
                offsetX={offsetLeft.value}
                offsetY={fillerOffset.value}
                scrollWidth={contentScrollWidth.value}
                onInnerResize={collectHeight}
                ref={fillerInnerRef}
                innerProps={props.innerProps}
                rtl={isRTL.value}
                extra={extraContent}
              >
                {renderChildren()}
              </Filler>
            </Component>
          </ResizeObserver>

          {inVirtual.value && scrollHeight.value > (props.height || 0) && (
            <ScrollBar
              ref={verticalScrollBarRef}
              prefixCls={props.prefixCls}
              scrollOffset={offsetTop.value}
              scrollRange={scrollHeight.value}
              rtl={isRTL.value}
              onScroll={onScrollBar}
              onStartMove={onScrollbarStartMove}
              onStopMove={onScrollbarStopMove}
              spinSize={verticalScrollBarSpinSize.value}
              containerSize={size.value.height}
              showScrollBar={props.showScrollBar}
              style={(props.styles as any)?.verticalScrollBar}
              thumbStyle={(props.styles as any)?.verticalScrollBarThumb}
            />
          )}

          {inVirtual.value && contentScrollWidth.value > size.value.width && (
            <ScrollBar
              ref={horizontalScrollBarRef}
              prefixCls={props.prefixCls}
              scrollOffset={offsetLeft.value}
              scrollRange={contentScrollWidth.value}
              rtl={isRTL.value}
              onScroll={onScrollBar}
              onStartMove={onScrollbarStartMove}
              onStopMove={onScrollbarStopMove}
              spinSize={horizontalScrollBarSpinSize.value}
              containerSize={size.value.width}
              horizontal
              showScrollBar={props.showScrollBar}
              style={(props.styles as any)?.horizontalScrollBar}
              thumbStyle={(props.styles as any)?.horizontalScrollBarThumb}
            />
          )}
        </div>
      )
    }
  },
})
