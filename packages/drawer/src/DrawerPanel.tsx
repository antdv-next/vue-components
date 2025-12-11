import type { KeyboardEventHandler, MouseEventHandler } from '@v-c/util/dist/EventInterface'
import { clsx } from '@v-c/util/src'
import { getAttrStyleAndClass } from '@v-c/util/src/props-util'
import { defineComponent } from 'vue'
import { useRefContext } from './context.ts'

export interface DrawerPanelEvents {
  onMouseEnter?: MouseEventHandler
  onMouseOver?: MouseEventHandler
  onMouseLeave?: MouseEventHandler
  onClick?: MouseEventHandler
  onKeyDown?: KeyboardEventHandler
  onKeyUp?: KeyboardEventHandler
}

export interface DrawerPanelProps extends DrawerPanelEvents {
  prefixCls: string
  id?: string
}

export default defineComponent<DrawerPanelProps>({
  name: 'DrawerPanel',
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    const { setPanel } = useRefContext()
    const setRef = (el: any) => {
      setPanel?.(el)
    }
    return () => {
      const { prefixCls, id } = props
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs)
      const attrsProps = {
        onMouseenter: props.onMouseEnter,
        onMouseover: props.onMouseOver,
        onMouseleave: props.onMouseLeave,
        onClick: props.onClick,
        onKeydown: props.onKeyDown,
        onKeyup: props.onKeyUp,
      }

      return (
        <div
          class={clsx(`${prefixCls}-section`, className)}
          style={style}
          role="dialog"
          {...restAttrs}
          {...attrsProps}
          aria-modal="true"
          id={id}
          ref={setRef}
        >
          {slots.default?.()}
        </div>
      )
    }
  },
})
