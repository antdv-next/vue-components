import type { Key, VueNode } from '@v-c/util/dist/type'
import type { CSSProperties, HTMLAttributes, PropType } from 'vue'
import ResizeObserver from '@v-c/resize-observer'
import { classNames } from '@v-c/util'
import { computed, defineComponent, onUnmounted } from 'vue'

const UNDEFINED = undefined

export default defineComponent({
  name: 'OverflowItem',
  inheritAttrs: false,
  props: {
    prefixCls: { type: String, required: true },
    item: Object as PropType<any>,
    class: { type: [String, Object, Array] as PropType<any>, default: undefined },
    style: Object as PropType<CSSProperties>,
    renderItem: Function as PropType<(item: any, info: { index: number }) => VueNode>,
    responsive: Boolean,
    responsiveDisabled: Boolean,
    itemKey: [String, Number] as PropType<Key>,
    registerSize: {
      type: Function as PropType<(key: Key, width: number | null) => void>,
      required: true,
    },
    display: Boolean,
    order: { type: Number, required: true },
    component: { type: [String, Object, Function] as PropType<any>, default: 'div' },
    invalidate: Boolean,
  },
  setup(props, { slots, attrs }) {
    const mergedHidden = computed(() => props.responsive && !props.display)

    function internalRegisterSize(width: number | null) {
      const key = (props.itemKey ?? props.order) as Key
      props.registerSize(key, width)
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
        responsiveDisabled,
        order,
        component: Component = 'div',
        style,
      } = props

      const children = slots.default?.()
      const childNode
        = renderItem && item !== UNDEFINED ? renderItem(item, { index: order }) : children

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
      const itemNode = (
        <Component
          class={classNames(!invalidate && prefixCls, props.class)}
          style={{
            ...overflowStyle,
            ...(style as CSSProperties),
          }}
          {...overflowProps}
          {...attrs}
        >
          {childNode}
        </Component>
      )

      if (!responsive) {
        return itemNode
      }

      return (
        <ResizeObserver
          disabled={responsiveDisabled}
          onResize={({ offsetWidth }) => {
            internalRegisterSize(offsetWidth)
          }}
          v-slots={{ default: () => itemNode }}
        />
      )
    }
  },
})
