import type { CSSProperties } from 'vue'
import type { RenderNode } from './interface.ts'
import { clsx } from '@v-c/util'
import { defineComponent } from 'vue'

export interface TransBtnProps {
  className: string
  style?: CSSProperties
  customizeIcon: RenderNode
  customizeIconProps?: any
  onMouseDown?: (event: MouseEvent) => void
  onClick?: (event: MouseEvent) => void
}

/**
 * Small wrapper for Select icons (clear/arrow/etc.).
 * Prevents default mousedown to avoid blurring or caret moves, and
 * renders a custom icon or a fallback icon span.
 *
 * DOM structure:
 * <span className={className} ...>
 *   { icon || <span className={`${className}-icon`}>{children}</span> }
 * </span>
 */

const TransBtn = defineComponent<TransBtnProps>(
  (props, { slots }) => {
    return () => {
      const { className, style, customizeIcon, customizeIconProps, onMouseDown, onClick } = props

      const icon = typeof customizeIcon === 'function' ? (customizeIcon as any)(customizeIconProps) : customizeIcon
      return (
        <span
          class={className}
          onMousedown={(event) => {
            event.preventDefault()
            onMouseDown?.(event)
          }}
          style={{ userSelect: 'none', WebkitUserSelect: 'none', ...style }}
          unselectable="on"
          onClick={onClick}
          aria-hidden
        >
          {icon !== undefined
            ? icon
            : (<span class={clsx(className.split(/\s+/).map(cls => `${cls}-icon`))}>{slots?.default?.()}</span>)}
        </span>
      )
    }
  },
  {
    name: 'TransBtn',
    inheritAttrs: false,
  },
)

export default TransBtn
