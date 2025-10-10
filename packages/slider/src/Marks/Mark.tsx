import type { CSSProperties, FunctionalComponent } from 'vue'
import { classNames } from '@v-c/util'
import { useInjectSlider } from '../context'
import { getDirectionStyle } from '../util'

export interface MarkProps {
  prefixCls: string
  value: number
  style?: CSSProperties
  onClick?: Function
}

const Mark: FunctionalComponent<MarkProps> = (props, { attrs, slots, emit }) => {
  const { prefixCls, value } = props
  const { min, max, direction, includedStart, includedEnd, included } = useInjectSlider()

  const textCls = `${prefixCls}-text`

  // ============================ Offset ============================
  const positionStyle = getDirectionStyle(direction.value, value, min.value, max.value)

  return (
    <span
      class={classNames(textCls, {
        [`${textCls}-active`]: included && includedStart <= value && value <= includedEnd,
      })}
      style={{ ...positionStyle, ...attrs.style as CSSProperties }}
      onMousedown={(e: MouseEvent) => {
        e.stopPropagation()
      }}
      onClick={() => {
        emit('click', value)
      }}
    >
      {slots.default?.()}
    </span>
  )
}

export default Mark
