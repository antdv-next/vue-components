import type { HTMLAttributes } from 'vue'
import pickAttrs from '@v-c/util/dist/pickAttrs'
import { classNames } from '@v-c/util'
import { defineComponent } from 'vue'

export type DrawerPanelAccessibility = Pick<
  HTMLAttributes,
  keyof HTMLAttributes & string
>

export interface DrawerPanelProps
  extends DrawerPanelAccessibility {
  prefixCls: string
  id?: string
  containerRef?: any
}

export default defineComponent({
  name: 'DrawerPanel',
  props: {
    prefixCls: {
      type: String,
      required: true,
    },
    id: String,
    containerRef: null,
  },
  emits: ['mouseenter', 'mouseover', 'mouseleave', 'click', 'keydown', 'keyup'],
  setup(props, { slots, attrs }) {
    return () => {
      const { prefixCls } = props

      return (
        <div
          class={classNames(`${prefixCls}-section`, [attrs.class])}
          role="dialog"
          {...pickAttrs(attrs, { aria: true })}
          aria-modal="true"
          {...props}
        >
          {slots.default?.()}
        </div>
      )
    }
  },
})
