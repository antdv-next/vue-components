import type { PropType } from 'vue'
import classNames from 'classnames'
import { defineComponent } from 'vue'
import { useInjectOverflowContext } from './context.tsx'
import Item from './Item'

export default defineComponent({
  name: 'RawItem',
  inheritAttrs: false,
  props: {
    component: String as PropType<any>,
    title: String,
    id: String,
    onMouseenter: { type: Function },
    onMouseleave: { type: Function },
    onClick: { type: Function },
    onKeydown: { type: Function },
    onFocus: { type: Function },
    role: String,
    tabindex: Number,
  },
  emits: ['mouseenter', 'mouseleave', 'keydown', 'click', 'focus'],
  setup(props, { slots, attrs }) {
    const context = useInjectOverflowContext()

    return () => {
      // Render directly when context not provided
      if (!context?.value) {
        const { component: Component = 'div', ...restProps } = props

        return (
          <Component {...restProps} {...attrs}>
            {slots.default?.()}
          </Component>
        )
      }

      const { className: contextClassName, ...restContext } = context.value
      // Do not pass context to sub item to avoid multiple measure
      return (
        <Item
          class={classNames(contextClassName, [attrs.class])}
          {...restContext}
          {...props}
          {...attrs}
          v-slots={slots}
        >
        </Item>
      )
    }
  },
})
