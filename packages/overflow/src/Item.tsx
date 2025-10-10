import type { Key } from '@v-c/util/dist/type'
import type { CSSProperties, HTMLAttributes, PropType, SlotsType, VNode } from 'vue'
import ResizeObserver from '@v-c/resize-observer'
import { classNames } from '@v-c/util'
import { computed, defineComponent, onUnmounted, ref } from 'vue'

// Use shared variable to save bundle size
const UNDEFINED = undefined

export default defineComponent({
  name: 'Item',
  inheritAttrs: false,
  props: {
    prefixCls: String,
    item: Object,
    renderItem: Function as PropType<(item: any) => VNode>,
    responsive: [Boolean, Number],
    itemKey: { type: [String, Number] as PropType<string | number> },
    registerSize: Function as PropType<(key: Key, width: number | null) => void>,
    display: Boolean,
    order: Number,
    component: { type: String as PropType<any>, default: 'div' },
    invalidate: Boolean,
    responsiveDisabled: Boolean,
  },
  slots: Object as SlotsType<{
    default: any
  }>,
  emits: ['mouseenter', 'mouseleave', 'keydown', 'click', 'focus'],
  setup(props, { attrs, slots, expose }) {
    const mergedHidden = computed(() => props.responsive && !props.display)
    const itemNodeRef = ref()

    expose({ itemNodeRef })

    // ================================ Effect ================================
    function internalRegisterSize(width: number | null) {
      props.registerSize?.(props.itemKey!, width)
    }

    onUnmounted(() => {
      internalRegisterSize(null)
    })

    return () => {
      const {
        prefixCls,
        invalidate,
        item,
        renderItem,
        responsive,
        registerSize,
        itemKey,
        display,
        order,
        component: Component = 'div',
        ...restProps
      } = props
      const children = slots.default?.()
      // ================================ Render ================================
      const childNode = renderItem && item !== UNDEFINED ? renderItem(item) : children

      let overflowStyle: CSSProperties | undefined
      if (!invalidate) {
        overflowStyle = {
          opacity: mergedHidden.value ? 0 : 1,
          height: mergedHidden.value ? 0 : UNDEFINED,
          overflowY: mergedHidden.value ? 'hidden' : UNDEFINED,
          order: responsive ? order : UNDEFINED,
          pointerEvents: mergedHidden.value ? 'none' : UNDEFINED,
          position: mergedHidden.value ? 'absolute' : UNDEFINED,
        }
      }

      const overflowProps: HTMLAttributes = {}
      if (mergedHidden.value) {
        overflowProps['aria-hidden'] = true
      }

      // 使用 disabled  避免结构不一致 导致子组件 rerender
      return (
        <ResizeObserver
          disabled={!responsive}
          onResize={({ offsetWidth }) => {
            internalRegisterSize(offsetWidth)
          }}
          v-slots={{
            default: () => (
              <Component
                class={classNames(!invalidate && prefixCls, [attrs.class])}
                style={overflowStyle}
                {...overflowProps}
                {...restProps}
                ref={itemNodeRef}
              >
                {childNode}
              </Component>
            ),
          }}
        >
        </ResizeObserver>
      )
    }
  },
})
