import type { Key, VueNode } from '@v-c/util/dist/type'
import type { CSSProperties, HTMLAttributes, PropType } from 'vue'
import ResizeObserver from '@v-c/resize-observer'
import { classNames } from '@v-c/util'
import { computed, defineComponent, ref, watchEffect } from 'vue'
import { OverflowContextProvider } from './context'
import useEffectState, { useBatcher } from './hooks/useEffectState'
import Item from './Item'
import RawItem from './RawItem'

export { OverflowContextProvider } from './context'

const RESPONSIVE = 'responsive' as const
const INVALIDATE = 'invalidate' as const

export interface OverflowProps<ItemType = any> {
  prefixCls?: string
  class?: any
  style?: CSSProperties
  data?: ItemType[]
  itemKey?: Key | ((item: ItemType) => Key)
  /** Used for `responsive`. It will limit render node to avoid perf issue */
  itemWidth?: number
  renderItem?: (item: ItemType, info: { index: number }) => VueNode
  /** @private Do not use in your production. Render raw node that need wrap Item by developer self */
  renderRawItem?: (item: ItemType, index: number) => VueNode
  maxCount?: number | typeof RESPONSIVE | typeof INVALIDATE
  renderRest?: VueNode | ((omittedItems: ItemType[]) => VueNode)
  /** @private Do not use in your production. Render raw node that need wrap Item by developer self */
  renderRawRest?: (omittedItems: ItemType[]) => VueNode
  prefix?: any
  suffix?: any
  component?: any
  itemComponent?: any

  /** @private This API may be refactor since not well design */
  onVisibleChange?: (visibleCount: number) => void

  /** When set to `full`, ssr will render full items by default and remove at client side */
  ssr?: 'full'
}

function defaultRenderRest<ItemType>(omittedItems: ItemType[]) {
  return `+ ${omittedItems.length} ...`
}

const overflowProps = {
  prefixCls: { type: String, default: 'vc-overflow' },
  data: { type: Array as PropType<any[]>, default: () => [] },
  renderItem: Function as PropType<(item: any, info: { index: number }) => VueNode>,
  renderRawItem: Function as PropType<(item: any, index: number) => VueNode>,
  itemKey: [String, Number, Function] as PropType<Key | ((item: any) => Key)>,
  itemWidth: { type: Number, default: 10 },
  maxCount: [Number, String] as PropType<number | typeof RESPONSIVE | typeof INVALIDATE>,
  renderRest: [Function, Object] as PropType<VueNode | ((omittedItems: any[]) => VueNode)>,
  renderRawRest: Function as PropType<(omittedItems: any[]) => VueNode>,
  prefix: {},
  suffix: {},
  component: [String, Object, Function] as PropType<any>,
  itemComponent: [String, Object, Function] as PropType<any>,
  onVisibleChange: Function as PropType<(visibleCount: number) => void>,
  ssr: String as PropType<'full'>,
} as const

const OverflowImpl = defineComponent({
  name: 'Overflow',
  inheritAttrs: false,
  props: overflowProps,
  emits: ['visibleChange'],
  setup(props, { attrs, slots, emit }) {
    const notifyEffectUpdate = useBatcher()

    const [containerWidth, setContainerWidth] = useEffectState<number | null>(
      notifyEffectUpdate,
      null,
    )
    const mergedContainerWidth = computed(() => containerWidth.value || 0)

    const [itemWidths, setItemWidths] = useEffectState<Map<Key, number>>(
      notifyEffectUpdate,
      new Map<Key, number>(),
    )

    const [prevRestWidth, setPrevRestWidth] = useEffectState<number>(
      notifyEffectUpdate,
      0,
    )
    const [restWidth, setRestWidth] = useEffectState<number>(notifyEffectUpdate, 0)

    const [prefixWidth, setPrefixWidth] = useEffectState<number>(notifyEffectUpdate, 0)
    const [suffixWidth, setSuffixWidth] = useEffectState<number>(notifyEffectUpdate, 0)

    const suffixFixedStart = ref<number | null>(null)

    const displayCount = ref<number | null>(null)
    const mergedDisplayCount = computed(() => {
      if (displayCount.value === null && props.ssr === 'full') {
        return Number.MAX_SAFE_INTEGER
      }

      return displayCount.value || 0
    })

    const restReady = ref(false)

    const itemPrefixCls = computed(() => `${props.prefixCls}-item`)

    // Always use the max width to avoid blink
    const mergedRestWidth = computed(() => Math.max(prevRestWidth.value!, restWidth.value!))

    // ================================= Data =================================
    const data = computed(() => props.data ?? [])
    const isResponsive = computed(() => props.maxCount === RESPONSIVE)
    const shouldResponsive = computed(() => data.value.length && isResponsive.value)
    const invalidate = computed(() => props.maxCount === INVALIDATE)

    /**
     * When is `responsive`, we will always render rest node to get the real width of it for calculation
     */
    const showRest = computed(
      () =>
        shouldResponsive.value
        || (typeof props.maxCount === 'number' && data.value.length > props.maxCount),
    )

    const mergedData = computed(() => {
      let items = data.value

      if (shouldResponsive.value) {
        if (containerWidth.value === null && props.ssr === 'full') {
          items = data.value
        }
        else {
          const mergedItemWidth = props.itemWidth ?? 10
          const maxLen = Math.min(
            data.value.length,
            mergedContainerWidth.value / mergedItemWidth,
          )
          items = data.value.slice(0, Math.floor(maxLen))
        }
      }
      else if (typeof props.maxCount === 'number') {
        items = data.value.slice(0, props.maxCount)
      }

      return items
    })

    const omittedItems = computed(() => {
      if (shouldResponsive.value) {
        return data.value.slice(mergedDisplayCount.value + 1)
      }
      return data.value.slice(mergedData.value.length)
    })

    // ================================= Item =================================
    const getKey = (item: any, index: number): Key => {
      const { itemKey } = props
      if (typeof itemKey === 'function') {
        return itemKey(item)
      }
      if (itemKey != null) {
        return (item as any)?.[itemKey] ?? index
      }
      return index
    }

    const mergedRenderItem = computed(
      () =>
        props.renderItem
        ?? (slots.renderItem
          ? (item: any, info: { index: number }) =>
              slots.renderItem?.({ item, index: info.index })
          : (item: any) => item),
    )
    const mergedRenderRawItem = computed(
      () =>
        props.renderRawItem
        ?? (slots.renderRawItem
          ? (item: any, index: number) => slots.renderRawItem?.({ item, index })
          : undefined),
    )
    const mergedRenderRest = computed(
      () =>
        props.renderRest
        ?? (slots.renderRest
          ? (omitted: any[]) => slots.renderRest?.({ items: omitted })
          : undefined),
    )
    const mergedRenderRawRest = computed(
      () =>
        props.renderRawRest
        ?? (slots.renderRawRest
          ? (omitted: any[]) => slots.renderRawRest?.({ items: omitted })
          : undefined),
    )
    const mergedPrefix = computed<VueNode | undefined>(
      () => props.prefix ?? slots.prefix?.(),
    )
    const mergedSuffix = computed<VueNode | undefined>(
      () => props.suffix ?? slots.suffix?.(),
    )

    function updateDisplayCount(
      count: number,
      suffixFixedStartVal: number | null | undefined,
      notReady?: boolean,
    ) {
      if (
        displayCount.value === count
        && (suffixFixedStartVal === undefined || suffixFixedStartVal === suffixFixedStart.value)
      ) {
        return
      }

      displayCount.value = count
      if (!notReady) {
        restReady.value = count < data.value.length - 1
        props.onVisibleChange?.(count)
        emit('visibleChange', count)
      }

      if (suffixFixedStartVal !== undefined) {
        suffixFixedStart.value = suffixFixedStartVal
      }
    }

    // ================================= Size =================================
    function onOverflowResize(_: object, element: HTMLElement) {
      setContainerWidth(element.clientWidth)
    }

    function registerSize(key: Key, width: number | null) {
      setItemWidths((origin) => {
        const clone = new Map(origin || [])

        if (width === null) {
          clone.delete(key)
        }
        else {
          clone.set(key, width)
        }
        return clone
      })
    }

    function registerOverflowSize(_: Key, width: number | null) {
      setRestWidth(width ?? 0)
      setPrevRestWidth(restWidth.value!)
    }

    function registerPrefixSize(_: Key, width: number | null) {
      setPrefixWidth(width ?? 0)
    }

    function registerSuffixSize(_: Key, width: number | null) {
      setSuffixWidth(width ?? 0)
    }

    // ================================ Effect ================================
    function getItemWidth(index: number) {
      const key = getKey(mergedData.value[index], index)
      return itemWidths.value?.get(key)
    }

    watchEffect(
      () => {
        const container = mergedContainerWidth.value
        const rest = mergedRestWidth.value
        const list = mergedData.value

        if (container && typeof rest === 'number' && list) {
          let totalWidth = prefixWidth.value! + suffixWidth.value!

          const len = list.length
          const lastIndex = len - 1

          // When data count change to 0, reset this since not loop will reach
          if (!len) {
            updateDisplayCount(0, null)
            return
          }

          for (let i = 0; i < len; i += 1) {
            let currentItemWidth = getItemWidth(i)

            // Fully will always render
            if (props.ssr === 'full') {
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
              (lastIndex === 0 && totalWidth <= container)
              // Last two width will be the final width
              || (i === lastIndex - 1 && totalWidth + (getItemWidth(lastIndex) || 0) <= container)
            ) {
              // Additional check if match the end
              updateDisplayCount(lastIndex, null)
              break
            }
            else if (totalWidth + rest > container) {
              // Can not hold all the content to show rest
              updateDisplayCount(
                i - 1,
                totalWidth - currentItemWidth - suffixWidth.value! + restWidth.value!,
              )
              break
            }
          }

          if ((props.suffix ?? slots.suffix?.()) && getItemWidth(0)! + suffixWidth.value! > container) {
            suffixFixedStart.value = null
          }
        }
      },
      { flush: 'post' },
    )

    return () => {
      const {
        prefixCls = 'vc-overflow',
        component: Component = 'div',
        itemComponent,
      } = props

      const renderRawItem = mergedRenderRawItem.value
      const renderRest = mergedRenderRest.value
      const renderRawRest = mergedRenderRawRest.value
      const prefix = mergedPrefix.value
      const suffix = mergedSuffix.value

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

        return (
          <Item
            {...itemSharedProps as any}
            order={index}
            key={key}
            item={item}
            renderItem={mergedRenderItem.value}
            itemKey={key}
            registerSize={registerSize}
            display={index <= mergedDisplayCount.value}
          />
        )
      }

      const restContextProps = {
        order: displayRest ? mergedDisplayCount.value : Number.MAX_SAFE_INTEGER,
        class: `${itemPrefixCls.value}-rest`,
        registerSize: registerOverflowSize,
        display: displayRest,
      }

      const mergedRenderRestFn = renderRest ?? defaultRenderRest

      const restNode = () => {
        if (renderRawRest) {
          return (
            <OverflowContextProvider value={{ ...itemSharedProps, ...restContextProps }}>
              {renderRawRest(omittedItems.value)}
            </OverflowContextProvider>
          )
        }

        return (
          <Item
            {...itemSharedProps as any}
            {...restContextProps as any}
            v-slots={{
              default: () =>
                typeof mergedRenderRestFn === 'function'
                  ? (mergedRenderRestFn as any)(omittedItems.value)
                  : mergedRenderRestFn,
            }}
          />
        )
      }

      const { class: classAttr, style: styleAttr, ...restAttrs } = attrs as HTMLAttributes

      const overflowNode = (
        <Component
          class={classNames(!invalidate.value && prefixCls, classAttr)}
          style={styleAttr as CSSProperties}
          {...restAttrs}
        >
          {prefix && (
            <Item
              {...itemSharedProps}
              responsive={isResponsive.value}
              responsiveDisabled={!shouldResponsive.value}
              order={-1}
              class={`${itemPrefixCls.value}-prefix`}
              registerSize={registerPrefixSize}
              display
              v-slots={{ default: () => prefix }}
            />
          )}

          {mergedData.value.map(internalRenderItemNode)}

          {showRest.value ? restNode() : null}

          {suffix && (
            <Item
              {...itemSharedProps}
              responsive={isResponsive.value}
              responsiveDisabled={!shouldResponsive.value}
              order={mergedDisplayCount.value}
              class={`${itemPrefixCls.value}-suffix`}
              registerSize={registerSuffixSize}
              display
              style={suffixStyle}
              v-slots={{ default: () => suffix }}
            />
          )}

          {slots.default?.()}
        </Component>
      )

      return isResponsive.value
        ? (
            <ResizeObserver onResize={onOverflowResize} disabled={!shouldResponsive.value}>
              {overflowNode}
            </ResizeObserver>
          )
        : (
            overflowNode
          )
    }
  },
})

type OverflowComponent = typeof OverflowImpl & {
  Item: typeof RawItem
  RESPONSIVE: typeof RESPONSIVE
  INVALIDATE: typeof INVALIDATE
}

const Overflow = OverflowImpl as OverflowComponent

Overflow.Item = RawItem
Overflow.RESPONSIVE = RESPONSIVE
Overflow.INVALIDATE = INVALIDATE

export default Overflow
