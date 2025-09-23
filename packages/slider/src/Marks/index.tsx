import type { CSSProperties, FunctionalComponent } from 'vue'
import Mark from './Mark'

export interface MarkObj {
  style?: CSSProperties
  label?: any
}

export interface InternalMarkObj extends MarkObj {
  value: number
}

export interface MarksProps {
  prefixCls: string
  marks?: InternalMarkObj[]
  onClick?: (value: number) => void
}

const Marks: FunctionalComponent<MarksProps> = (props, { emit, slots }) => {
  const { prefixCls, marks = [] } = props

  const markPrefixCls = `${prefixCls}-mark`

  // Not render mark if empty
  if (!marks.length) {
    return null
  }

  return (
    <div class={markPrefixCls}>
      {marks.map(({ value, style, label }) => (
        <Mark key={value} prefixCls={markPrefixCls} style={style} value={value} onClick={() => emit('click', value)}>
          {slots.mark?.({ point: value, label }) || label}
        </Mark>
      ))}
    </div>
  )
}

export default Marks
