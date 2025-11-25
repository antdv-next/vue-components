import type { CSSProperties } from 'vue'
import { classNames } from '@v-c/util'
import { defineComponent } from 'vue'
import { useInjectSlider } from '../context'
import { getDirectionStyle } from '../util'

export interface MarkProps {
  prefixCls: string
  value: number
  style?: CSSProperties
  onClick?: Function
}

const Mark = defineComponent<MarkProps>((props, { attrs, slots }) => {
  const { min, max, direction, includedStart, includedEnd, included } = useInjectSlider()
  return () => {
    const { prefixCls, value } = props

    const textCls = `${prefixCls}-text`

    // ============================ Offset ============================
    const positionStyle = getDirectionStyle(direction.value, value, min.value, max.value)

    return (
      <span
        class={classNames(textCls, {
          [`${textCls}-active`]: included && includedStart.value <= value && value <= includedEnd.value,
        })}
        style={{ ...positionStyle, ...attrs.style as CSSProperties }}
        onMousedown={(e: MouseEvent) => {
          e.stopPropagation()
        }}
        onClick={() => {
          props?.onClick?.(value)
        }}
      >
        {slots.default?.()}
      </span>
    )
  }
})

export default Mark
