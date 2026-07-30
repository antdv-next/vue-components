import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'
import { clsx } from '@v-c/util'
import { defineComponent } from 'vue'
import { usePickerContext } from '../context'

export interface ClearIconProps {
  icon?: VueNode
  onClear: VoidFunction
}

/**
 * Rendered as a real `<button>` rather than a `<span role="button">` so it is
 * focusable and activatable by keyboard, and announced with a label.
 */
const ClearIcon = defineComponent<ClearIconProps>((props, { attrs }) => {
  const ctx = usePickerContext()

  return () => {
    const { prefixCls, classNames, styles, locale } = ctx.value

    const { class: attrClass, style: attrStyle, ...restAttrs } = attrs as any
    const mergedAttrStyle
      = attrStyle && typeof attrStyle === 'object'
        ? attrStyle as CSSProperties
        : {}

    return (
      <button
        {...restAttrs}
        type="button"
        aria-label={locale.clear}
        class={clsx(`${prefixCls}-clear`, classNames.suffix, attrClass)}
        style={{ ...(styles.suffix || {}), ...mergedAttrStyle }}
        onMousedown={(e: MouseEvent) => {
          e.preventDefault()
        }}
        onClick={(e: MouseEvent) => {
          e.stopPropagation()
          props.onClear()
        }}
      >
        {props.icon}
      </button>
    )
  }
}, {
  name: 'ClearIcon',
  inheritAttrs: false,
})

export default ClearIcon
