import type { Key } from '@v-c/util/dist/type'

import type { CSSProperties, PropType, VNode } from 'vue'
import type { InnerProps } from './Filler'
import type { ExtraRenderInfo } from './interface'
import type { ScrollBarRef } from './ScrollBar'
import ResizeObserver from '@v-c/resize-observer'
import {
  computed,

  defineComponent,

  ref,
  shallowRef,

  watch,
} from 'vue'
import Filler from './Filler'
import useDiffItem from './hooks/useDiffItem'
import useFrameWheel from './hooks/useFrameWheel'
import { useGetSize } from './hooks/useGetSize'
import useHeights from './hooks/useHeights'
import useMobileTouchMove from './hooks/useMobileTouchMove'
import useScrollDrag from './hooks/useScrollDrag'
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

export interface ListRef {
  nativeElement?: HTMLDivElement
  scrollTo: (arg?: number | ScrollConfig) => void
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

export interface ListProps<T = any> {
  prefixCls?: string
  data?: T[]
  height?: number
  itemHeight?: number
  fullHeight?: boolean
  itemKey: Key | ((item: T) => Key)
  component?: string
  virtual?: boolean
  onScroll?: (e: Event) => void
  onVirtualScroll?: (info: ScrollInfo) => void
  onVisibleChange?: (visibleList: T[], fullList: T[]) => void
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
    virtual: { type: Boolean, default: true },
    onScroll: Function as PropType<(e: Event) => void>,
    onVirtualScroll: Function as PropType<(info: ScrollInfo) => void>,
    onVisibleChange: Function as PropType<(visibleList: any[], fullList: any[]) => void>,
    innerProps: Object as PropType<InnerProps>,
    extraRender: Function as PropType<(info: ExtraRenderInfo) => VNode>,
  },
  setup(props, { expose, attrs, slots }) {
    // =============================== Item Key ===============================
    const getKey = (item: any): Key => {
      if (typeof props.itemKey === 'function') {
        return props.itemKey(item)
      }
      return item?.[props.itemKey as string]
    }

    // ================================ Height ================================
    const [setInstanceRef, collectHeight, heights, heightUpdatedMark] = useHeights(
      getKey,
      undefined,
      undefined,
    )

    // ================================= MISC =================================
    const mergedData = computed(() => props.data || EMPTY_DATA)

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
        && Math.max(props.itemHeight! * data.length, containerHeight.value) > props.height!
      )
    })

    const componentRef = ref<HTMLDivElement>()
    const fillerInnerRef = ref<HTMLDivElement>()
    const containerRef = ref<HTMLDivElement>()
    const verticalScrollBarRef = shallowRef<ScrollBarRef>()

    const offsetTop = ref(0)
    const offsetLeft = ref(0)
    const scrollMoving = ref(false)

    // ScrollBar related
    const verticalScrollBarSpinSize = ref(0)
    const scrollWidth = ref(0)

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
    useDiffItem(mergedData, getKey)

    watch(
      [
        () => inVirtual.value,
        () => useVirtual.value,
        () => offsetTop.value,
        () => mergedData.value,
        () => heightUpdatedMark.value,
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
        const data = mergedData.value

        for (let i = 0; i < dataLen; i += 1) {
          const item = data[i]
          const key = getKey(item)

          const cacheHeight = heights.get(key)
          const currentItemBottom = itemTop + (cacheHeight === undefined ? props.itemHeight! : cacheHeight)

          if (currentItemBottom >= offsetTop.value && startIndex === undefined) {
            startIndex = i
            startOffset = itemTop
          }

          if (currentItemBottom > offsetTop.value + props.height! && endIndex === undefined) {
            endIndex = i
          }

          itemTop = currentItemBottom
        }

        if (startIndex === undefined) {
          startIndex = 0
          startOffset = 0
          endIndex = Math.ceil(props.height! / props.itemHeight!)
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
      () => scrollHeight.value,
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
    }

    // =============================== Scroll ===============================
    const getVirtualScrollInfo = () => ({
      x: offsetLeft.value,
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
    const isScrollAtTop = computed(() => offsetTop.value === 0)
    const isScrollAtBottom = computed(() => offsetTop.value + props.height! >= scrollHeight.value)
    const isScrollAtLeft = computed(() => offsetLeft.value === 0)
    const isScrollAtRight = computed(() => offsetLeft.value + size.value.width >= scrollWidth.value)

    // ========================== Wheel & Touch =========================
    const delayHideScrollBar = () => {
      verticalScrollBarRef.value?.delayHidden()
    }

    const [onWheel] = useFrameWheel(
      inVirtual,
      isScrollAtTop,
      isScrollAtBottom,
      isScrollAtLeft,
      isScrollAtRight,
      false, // horizontalScroll
      (offsetY, isHorizontal) => {
        if (isHorizontal) {
          // Not implemented yet
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
          // Not implemented yet
          return false
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
        // Not implemented yet
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

    // Calculate ScrollBar spin size
    watch(
      [() => props.height, () => scrollHeight.value, () => inVirtual.value, () => size.value.height],
      () => {
        if (inVirtual.value && props.height && scrollHeight.value) {
          // First parameter is container size, second is scroll range
          verticalScrollBarSpinSize.value = getSpinSize(size.value.height, scrollHeight.value)
        }
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
    const scrollTo = (config?: number | ScrollConfig) => {
      if (config === null || config === undefined) {
        return
      }

      if (typeof config === 'number') {
        syncScrollTop(config)
      }
      else if (config && typeof config === 'object') {
        let scrollTop: number | undefined

        if ('left' in config) {
          offsetLeft.value = config.left || 0
        }

        if ('top' in config) {
          scrollTop = config.top
        }
        else if ('index' in config) {
          const index = config.index || 0
          const item = mergedData.value[index]
          if (item) {
            let itemTop = 0
            for (let i = 0; i < index; i += 1) {
              const key = getKey(mergedData.value[i])
              const cacheHeight = heights.get(key)
              itemTop += cacheHeight === undefined ? props.itemHeight! : cacheHeight
            }
            scrollTop = itemTop
          }
        }
        else if ('key' in config) {
          const index = mergedData.value.findIndex(item => getKey(item) === config.key)
          if (index >= 0) {
            let itemTop = 0
            for (let i = 0; i < index; i += 1) {
              const key = getKey(mergedData.value[i])
              const cacheHeight = heights.get(key)
              itemTop += cacheHeight === undefined ? props.itemHeight! : cacheHeight
            }
            scrollTop = itemTop
          }
        }

        if (scrollTop !== undefined) {
          syncScrollTop(scrollTop)
        }
      }
    }

    expose({
      nativeElement: containerRef,
      getScrollInfo: getVirtualScrollInfo,
      scrollTo,
    })

    // ================================ Effect ================================
    watch(
      [() => start.value, () => end.value, () => mergedData.value],
      () => {
        if (props.onVisibleChange) {
          const renderList = mergedData.value.slice(start.value, end.value + 1)
          props.onVisibleChange(renderList, mergedData.value)
        }
      },
    )

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

    const getSize = useGetSize(mergedData, getKey, heights, props.itemHeight!)

    return () => {
      const componentStyle: CSSProperties = {}
      if (props.height) {
        componentStyle[props.fullHeight ? 'height' : 'maxHeight'] = `${props.height}px`
        Object.assign(componentStyle, ScrollStyle)

        // Use custom ScrollBar when virtual scrolling is enabled
        if (useVirtual.value) {
          componentStyle.overflowY = 'hidden'

          if (scrollWidth.value) {
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
        rtl: false,
        getSize: getSize.value,
      })

      const Component = props.component as any

      return (
        <div
          ref={containerRef}
          style={{ position: 'relative', ...(attrs.style as CSSProperties) }}
          class={[props.prefixCls, attrs.class]}
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
                onInnerResize={collectHeight}
                ref={fillerInnerRef}
                innerProps={props.innerProps}
                rtl={false}
                extra={extraContent}
              >
                {renderChildren()}
              </Filler>
            </Component>
          </ResizeObserver>

          {/* ScrollBar */}
          {inVirtual.value && scrollHeight.value > (props.height || 0) && (
            <ScrollBar
              ref={verticalScrollBarRef}
              prefixCls={props.prefixCls}
              scrollOffset={offsetTop.value}
              scrollRange={scrollHeight.value}
              rtl={false}
              onScroll={onScrollBar}
              onStartMove={onScrollbarStartMove}
              onStopMove={onScrollbarStopMove}
              spinSize={verticalScrollBarSpinSize.value}
              containerSize={size.value.height}
              showScrollBar="optional"
            />
          )}
        </div>
      )
    }
  },
})
