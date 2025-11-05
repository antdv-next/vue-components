import type { PropType } from 'vue'
import { classNames } from '@v-c/util'
import { defineComponent } from 'vue'
import { OverflowContextProvider, useInjectOverflowContext } from './context'
import Item from './Item'

export default defineComponent({
  name: 'OverflowRawItem',
  inheritAttrs: false,
  props: {
    component: { type: [String, Object, Function] as PropType<any>, default: 'div' },
  },
  setup(props, { slots, attrs }) {
    const context = useInjectOverflowContext()

    return () => {
      if (!context?.value) {
        const Component = (props.component ?? 'div') as any
        return <Component {...attrs}>{slots.default?.()}</Component>
      }

      const { className: contextClassName, ...restContext } = context.value
      const { class: classAttr, ...restAttrs } = attrs

      return (
        <OverflowContextProvider value={null}>
          <Item
            {...restContext}
            {...restAttrs}
            class={classNames(contextClassName, classAttr as any)}
            component={props.component}
            v-slots={slots}
          />
        </OverflowContextProvider>
      )
    }
  },
})
