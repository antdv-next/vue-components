import type { Key } from '@v-c/util/dist/type'
import type { CSSProperties, PropType, SlotsType, VNode } from 'vue'
import ResizeObserver from '@v-c/resize-observer'
// import { useLayoutEffect } from '@v-c/util/dist/hooks/useLayoutEffect'
import classNames from 'classnames'
import { computed, defineComponent, ref, shallowRef, watch } from 'vue'
import { OverflowContextProvider } from './context.tsx'
import Item from './Item'
import RawItem from './RawItem'

const RESPONSIVE = 'responsive' as const
const INVALIDATE = 'invalidate' as const

export { OverflowContextProvider } from './context.tsx'

function defaultRenderRest<ItemType>(omittedItems: ItemType[]) {
  return `+ ${omittedItems.length} ...`
}

const Overflow = defineComponent({
  name: 'Overflow',
  inheritAttrs: false,
  props: {
    prefixCls: { type: String, default: 'vc-overflow' },
    data: { type: Array, default: () => [] },
    renderItem: Function as PropType<(item: any, info: { index: number }) => VNode | string>,
    renderRawItem: Function as PropType<(item: any, index: number) => VNode>,
    itemKey: [String, Function] as PropType<string | ((item: any) => string | number)>,
    itemWidth: { type: Number, default: 10 },
    ssr: String as PropType<'full'>,
    maxCount: [Number, String] as PropType<number | typeof RESPONSIVE | typeof INVALIDATE>,
    renderRest: [Function, Object] as PropType<VNode | ((omittedItems: any[]) => VNode | string)>,
    renderRawRest: Function as PropType<(omittedItems: any[]) => VNode>,
    suffix: [Object, String] as PropType<VNode | string>,
    component: { type: String as PropType<any>, default: 'div' },
    itemComponent: [String, Object],
    onVisibleChange: Function as PropType<(visibleCount: number) => void>,
  },
  slots: Object as SlotsType<{
    renderItem: any
    renderRawItem: any
    renderRest: any
    renderRawRest: any
    suffix: any
    default: any
  }>,
  emits: ['visibleChange', 'mouseenter', 'mouseleave', 'keydown', 'click', 'focus'],
  setup(props, { attrs, slots }) {
    const fullySSR = computed(() => props.ssr === 'full')
    // const notifyEffectUpdate = useBatcher()

    const containerWidth = shallowRef<number | null>(null)
    const mergedContainerWidth = computed(() => containerWidth.value || 0)

    const itemWidths = shallowRef<Map<Key, number>>(new Map<Key, number>())
    const prevRestWidth = shallowRef<number>(0)
    const restWidth = shallowRef<number>(0)
    const suffixWidth = shallowRef<number>(0)
    const suffixFixedStart = shallowRef<number | null>(null)
    const displayCount = shallowRef<number | null>(null)

    const mergedDisplayCount = computed(() => {
      if (displayCount.value === null && fullySSR.value) {
        return Number.MAX_SAFE_INTEGER
      }
      return displayCount.value || 0
    })

    const restReady = ref(false)
    const itemPrefixCls = computed(() => `${props.prefixCls}-item`)

    // Always use the max width to avoid blink
    const mergedRestWidth = computed(() => Math.max(prevRestWidth.value, restWidth.value))

    // ================================= Data =================================
    const isResponsive = computed(() => props.maxCount === RESPONSIVE)
    const shouldResponsive = computed(() => props.data.length && isResponsive.value)
    const invalidate = computed(() => props.maxCount === INVALIDATE)

    /**
     * When is `responsive`, we will always render rest node to get the real width of it for calculation
     */
    const showRest = computed(() =>
      shouldResponsive.value
      || (typeof props.maxCount === 'number' && props.data.length > props.maxCount),
    )

    const mergedData = computed(() => {
      let items = props.data

      // 当 invalidate 为 true 时，直接返回所有数据，不进行任何过滤
      if (invalidate.value) {
        return props.data
      }

      if (shouldResponsive.value) {
        if (containerWidth.value === null && fullySSR.value) {
          items = props.data
        }
        else {
          items = props.data.slice(
            0,
            Math.min(props.data.length, mergedContainerWidth.value / props.itemWidth),
          )
        }
      }
      else if (typeof props.maxCount === 'number') {
        items = props.data.slice(0, props.maxCount)
      }

      return items
    })

    const omittedItems = computed(() => {
      if (shouldResponsive.value) {
        return props.data.slice(mergedDisplayCount.value + 1)
      }
      return props.data.slice(mergedData.value.length)
    })

    // ================================= Item =================================
    const getKey = (item: any, index: number) => {
      if (typeof props.itemKey === 'function') {
        return props.itemKey(item)
      }
      return (props.itemKey && item[props.itemKey]) ?? index
    }

    function updateDisplayCount(
      count: number,
      suffixFixedStartVal: number | null | undefined,
      notReady?: boolean,
    ) {
      // Vue 3 will sync render even when the value is same in some case.
      // We take `mergedData` as deps which may cause dead loop if it's dynamic generate.
      if (
        displayCount.value === count
        && (suffixFixedStartVal === undefined || suffixFixedStartVal === suffixFixedStart.value)
      ) {
        return
      }

      displayCount.value = count
      if (!notReady) {
        restReady.value = count < props.data.length - 1

        props.onVisibleChange?.(count)
      }

      if (suffixFixedStartVal !== undefined) {
        suffixFixedStart.value = suffixFixedStartVal
      }
    }

    // ================================= Size =================================
    function onOverflowResize(_: any, element: HTMLElement) {
      containerWidth.value = element.clientWidth
    }

    function registerSize(key: string | number, width: number | null) {
      const clone = new Map(itemWidths.value)

      if (width === null) {
        clone.delete(key)
      }
      else {
        clone.set(key, width)
      }
      itemWidths.value = clone
    }

    function registerOverflowSize(_: string | number, width: number | null) {
      restWidth.value = width!
      prevRestWidth.value = restWidth.value
    }

    function registerSuffixSize(_: string | number, width: number | null) {
      suffixWidth.value = width!
    }

    // ================================ Effect ================================
    function getItemWidth(index: number) {
      return itemWidths.value.get(getKey(mergedData.value[index], index))
    }

    watch([mergedContainerWidth, itemWidths, restWidth, suffixWidth, () => props.itemKey, mergedData], () => {
      if (
        mergedContainerWidth.value
        && typeof mergedRestWidth.value === 'number'
        && mergedData.value
      ) {
        let totalWidth = suffixWidth.value

        const len = mergedData.value.length
        const lastIndex = len - 1

        // When data count change to 0, reset this since not loop will reach
        if (!len) {
          updateDisplayCount(0, null)
          return
        }

        for (let i = 0; i < len; i += 1) {
          let currentItemWidth = getItemWidth(i)

          // Fully will always render
          if (fullySSR.value) {
            currentItemWidth = currentItemWidth || 0
          }

          // Break since data not ready
          if (currentItemWidth === undefined) {
            updateDisplayCount(i - 1, undefined, true)
            break
          }

          // Find best match
          totalWidth += currentItemWidth

          if (
            // Only one means `totalWidth` is the final width
            (lastIndex === 0 && totalWidth <= mergedContainerWidth.value)
            // Last two width will be the final width
            || (i === lastIndex - 1
              && totalWidth + getItemWidth(lastIndex)! <= mergedContainerWidth.value)
          ) {
            // Additional check if match the end
            updateDisplayCount(lastIndex, null)
            break
          }
          else if (totalWidth + mergedRestWidth.value > mergedContainerWidth.value) {
            // Can not hold all the content to show rest
            updateDisplayCount(
              i - 1,
              totalWidth - currentItemWidth - suffixWidth.value + restWidth.value,
            )
            break
          }
        }

        if (props.suffix && getItemWidth(0)! + suffixWidth.value > mergedContainerWidth.value) {
          suffixFixedStart.value = null
        }
      }
    })

    return () => {
      const {
        prefixCls = 'vc-overflow',
        data = [],
        renderItem = slots?.renderItem,
        renderRawItem = slots?.renderRawItem,
        itemKey,
        itemWidth = 10,
        ssr,
        maxCount,
        renderRest = slots?.renderRest,
        renderRawRest = slots?.renderRawRest,
        suffix = slots?.suffix?.(),
        component: Component = 'div',
        itemComponent,
        onVisibleChange,
        ...restProps
      } = props
      const mergedRenderItem = renderItem || ((item: any) => item)

      // ================================ Render ================================
      const displayRest = restReady.value && !!omittedItems.value.length

      let suffixStyle: CSSProperties = {}
      if (suffixFixedStart.value !== null && shouldResponsive.value) {
        suffixStyle = {
          position: 'absolute',
          left: `${suffixFixedStart.value}px`,
          top: 0,
        }
      }

      const itemSharedProps = {
        prefixCls: itemPrefixCls.value,
        responsive: shouldResponsive.value,
        component: itemComponent,
        invalidate: invalidate.value,
      }

      // >>>>> Choice render fun by `renderRawItem`
      const internalRenderItemNode = (item: any, index: number) => {
        const key = getKey(item, index)

        if (renderRawItem) {
          return (
            <OverflowContextProvider
              key={key}
              value={{
                ...itemSharedProps,
                order: index,
                item,
                itemKey: key,
                registerSize,
                display: index <= mergedDisplayCount.value,
              }}
            >
              {renderRawItem(item, index)}
            </OverflowContextProvider>
          )
        }
        else {
          return (
            <Item
              {...itemSharedProps}
              order={index}
              key={key}
              item={item}
              renderItem={mergedRenderItem}
              itemKey={key}
              registerSize={registerSize}
              display={index <= mergedDisplayCount.value}
            />
          )
        }
      }

      // >>>>> Rest node
      const restContextProps = {
        order: displayRest ? mergedDisplayCount.value : Number.MAX_SAFE_INTEGER,
        class: `${itemPrefixCls.value}-rest`,
        registerSize: registerOverflowSize,
        display: displayRest,
      }

      const mergedRenderRest = renderRest || defaultRenderRest

      const restNode = () => {
        if (renderRawRest) {
          return (
            <OverflowContextProvider value={{
              ...itemSharedProps,
              ...restContextProps,
            }}
            >
              {renderRawRest(omittedItems.value)}
            </OverflowContextProvider>
          )
        }
        else {
          return (
            <Item
              {...itemSharedProps}
              // When not show, order should be the last
              {...restContextProps}
              v-slots={{
                default: () =>
                  typeof mergedRenderRest === 'function'
                    ? mergedRenderRest(omittedItems.value)
                    : mergedRenderRest,
              }}
            />
          )
        }
      }
      const overflowNode = (
        <Component
          class={classNames(!invalidate.value && prefixCls, [attrs.class])}
          style={{ ...attrs.style as CSSProperties }}
          {...restProps}
        >
          {mergedData.value!.map((item, index) => internalRenderItemNode(item, index))}

          {/* Rest Count Item */}
          {showRest.value ? restNode() : null}

          {/* Suffix Node */}
          {suffix && (
            <Item
              {...itemSharedProps}
              {...attrs}
              responsive={isResponsive.value}
              responsiveDisabled={!shouldResponsive.value}
              order={mergedDisplayCount.value}
              class={`${itemPrefixCls.value}-suffix`}
              registerSize={registerSuffixSize}
              display
              style={suffixStyle}
              v-slots={{
                default: () => suffix,
              }}
            >
            </Item>
          )}
          {slots.default?.()}
        </Component>
      )

      return (
        <>
          {isResponsive.value
            ? (
                <ResizeObserver
                  onResize={onOverflowResize}
                  disabled={!isResponsive.value}
                  v-slots={{ default: () => overflowNode }}
                />
              )
            : overflowNode}
        </>
      )
    }
  },
})

Overflow.Item = RawItem
Overflow.RESPONSIVE = RESPONSIVE
Overflow.INVALIDATE = INVALIDATE

export default Overflow
