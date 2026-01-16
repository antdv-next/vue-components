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

const Mark = defineComponent<MarkProps>((props, { slots }) => {
  const sliderContext = useInjectSlider()
  return () => {
    const { prefixCls, value } = props
    const { min, max, direction, includedStart, includedEnd, included } = sliderContext.value

    const textCls = `${prefixCls}-text`

    // ============================ Offset ============================
    const positionStyle = getDirectionStyle(direction, value, min, max)

    return (
      <span
        class={classNames(textCls, {
          [`${textCls}-active`]: included && includedStart <= value && value <= includedEnd,
        })}
        style={{ ...positionStyle, ...(props.style || {}) as CSSProperties }}
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
