import type { CSSProperties } from 'vue'
import type { RenderNode } from './BaseSelect'
import { clsx } from '@v-c/util'
import { defineComponent } from 'vue'

export interface TransBtnProps {
  className: string
  style?: CSSProperties
  customizeIcon: RenderNode
  customizeIconProps?: any
  onMouseDown?: (event: MouseEvent) => void
  onClick?: (event: MouseEvent) => void
  children?: any
}

const TransBtn = defineComponent<TransBtnProps>((props) => {
  return () => {
    const { className, style, customizeIcon, customizeIconProps, children, onMouseDown, onClick } = props

    const icon = typeof customizeIcon === 'function' ? customizeIcon(customizeIconProps) : customizeIcon

    return (
      <span
        class={className}
        onMousedown={(event) => {
          event.preventDefault()
          onMouseDown?.(event)
        }}
        style={{ userSelect: 'none', WebkitUserSelect: 'none', ...style }}
        unselectable="on"
        onClick={onClick as any}
        aria-hidden
      >
        {icon !== undefined
          ? (
              icon
            )
          : (
              <span class={clsx(className.split(/\s+/).map(cls => `${cls}-icon`))}>{children}</span>
            )}
      </span>
    )
  }
})

export default TransBtn
