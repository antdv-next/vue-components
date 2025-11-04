import type { CSSProperties } from 'vue'
import type { TooltipProps } from './Tooltip.tsx'
import { clsx } from '@v-c/util'
import { defineComponent } from 'vue'

export interface ContentProps {
  prefixCls?: string
  id?: string
  classNames?: TooltipProps['classNames']
  styles?: TooltipProps['styles']
  className?: string
  style?: CSSProperties
}

const Popup = defineComponent<ContentProps>(
  (props, { slots }) => {
    return () => {
      const { prefixCls, id, classNames, styles, className, style } = props
      const children = slots?.default?.()
      return (
        <div
          id={id}
          class={clsx(`${prefixCls}-container`, classNames?.container, className)}
          style={{ ...styles?.container, ...style }}
          role="tooltip"
        >
          {children}
        </div>
      )
    }
  },
)

export default Popup
