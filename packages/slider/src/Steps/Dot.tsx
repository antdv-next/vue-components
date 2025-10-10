import type { CSSProperties, FunctionalComponent } from 'vue'
import { classNames } from '@v-c/util'
import { useInjectSlider } from '../context'
import { getDirectionStyle } from '../util'

export interface DotProps {
  prefixCls: string
  value: number
  style?: CSSProperties | ((dotValue: number) => CSSProperties)
  activeStyle?: CSSProperties | ((dotValue: number) => CSSProperties)
}

const Dot: FunctionalComponent<DotProps> = (props, { attrs }) => {
  const { prefixCls, value, activeStyle } = props
  const { min, max, direction, included, includedStart, includedEnd } = useInjectSlider()

  const dotClassName = `${prefixCls}-dot`
  const active = included && includedStart <= value && value <= includedEnd

  // ============================ Offset ============================
  let mergedStyle: CSSProperties = {
    ...getDirectionStyle(direction.value, value, min.value, max.value),
  }

  if (active) {
    mergedStyle = {
      ...mergedStyle,
      ...(typeof activeStyle === 'function' ? activeStyle(value) : activeStyle),
    }
  }

  return (
    <span
      class={classNames(dotClassName, { [`${dotClassName}-active`]: active })}
      style={{ ...mergedStyle, ...attrs.style as CSSProperties }}
    />
  )
}

export default Dot
