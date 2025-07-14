import type { CSSProperties, FunctionalComponent } from 'vue'
import classNames from 'classnames'

export interface ColorBlockProps {
  color: string
  prefixCls?: string
}

const ColorBlock: FunctionalComponent<ColorBlockProps> = (props, { attrs, emit }) => {
  const {
    color,
    prefixCls,
  } = props
  const colorBlockCls = `${prefixCls}-color-block`
  const handleClickChange = (e: Event) => {
    emit('click', e)
  }
  return (
    <div
      class={classNames(colorBlockCls, [attrs.class])}
      style={{ ...attrs.style as CSSProperties }}
      onClick={handleClickChange}
    >
      <div
        class={`${colorBlockCls}-inner`}
        style={{
          background: color,
        }}
      />
    </div>
  )
}

ColorBlock.inheritAttrs = false

export default ColorBlock
