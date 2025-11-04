import type { CSSProperties, FunctionalComponent } from 'vue'
import { classNames } from '@v-c/util'

export interface ContentProps {
  prefixCls?: string
  id?: string
  overlayInnerStyle?: CSSProperties
  bodyClassName?: string
}

const Popup: FunctionalComponent<ContentProps> = (props, { attrs, slots }) => {
  const {
    prefixCls,
    id,
    overlayInnerStyle: innerStyle,
    bodyClassName,
  } = props

  return (
    <div class={classNames(`${prefixCls}-content`, [attrs.class])} style={{ ...attrs.style as CSSProperties }}>
      <div
        class={classNames(`${prefixCls}-inner`, bodyClassName)}
        id={id}
        role="tooltip"
        style={innerStyle}
      >
        {slots.default?.()}
      </div>
    </div>
  )
}

Popup.displayName = 'Popup'

export default Popup
