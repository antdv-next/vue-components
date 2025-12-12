import type { KeyboardEventHandler, MouseEventHandler } from '@v-c/util/dist/EventInterface'
import { clsx } from '@v-c/util'
import pickAttrs from '@v-c/util/dist/pickAttrs'
import { getAttrStyleAndClass } from '@v-c/util/dist/props-util'
import { defineComponent } from 'vue'
import { useRefContext } from './context'

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
          {...pickAttrs(restAttrs, { aria: true })}
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
