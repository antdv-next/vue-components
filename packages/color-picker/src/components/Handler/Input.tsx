import type { CSSProperties } from 'vue'

// Opacity keeps inputs focusable and exposed to assistive technology.
// Inline styles also cover consumers that do not load our stylesheet.
const RANGE_INPUT_STYLE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  margin: 0,
  padding: 0,
  opacity: 0,
  pointerEvents: 'none',
}

export type AxisType = 'x' | 'y'

export interface InputProps {
  prefixCls?: string
  axisType: AxisType
  inputRef: (el: any) => void
  attrs: Record<string, any>
  onChange: (axisType: AxisType, event: Event) => void
  onFocus: (axisType: AxisType, event: FocusEvent) => void
}

function renderInput(props: InputProps) {
  const { prefixCls, axisType, inputRef, attrs, onChange, onFocus } = props
  return (
    <input
      {...attrs}
      ref={inputRef}
      type="range"
      min={attrs.min ?? 0}
      max={attrs.max ?? 100}
      step={1}
      class={`${prefixCls}-handler-range`}
      style={RANGE_INPUT_STYLE}
      onInput={(event: Event) => onChange(axisType, event)}
      onFocus={(event: FocusEvent) => onFocus(axisType, event)}
    />
  )
}

export default renderInput
