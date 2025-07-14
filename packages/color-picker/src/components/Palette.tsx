import type { CSSProperties, FunctionalComponent } from 'vue'

const Palette: FunctionalComponent<{
  prefixCls?: string
}> = (props, { attrs, slots }) => {
  const { prefixCls } = props
  return (
    <div
      class={`${prefixCls}-palette`}
      style={{
        position: 'relative',
        ...attrs.style as CSSProperties,
      }}
    >
      {slots.default?.()}
    </div>
  )
}

Palette.inheritAttrs = false

export default Palette
