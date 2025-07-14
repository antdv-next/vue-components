import type { FunctionalComponent } from 'vue'
import classNames from 'classnames'

type HandlerSize = 'default' | 'small'

const Handler: FunctionalComponent<{
  size?: HandlerSize
  color?: string
  prefixCls?: string
}> = (props) => {
  const { size = 'default', color, prefixCls } = props
  return (
    <div
      class={classNames(`${prefixCls}-handler`, {
        [`${prefixCls}-handler-sm`]: size === 'small',
      })}
      style={{
        backgroundColor: color,
      }}
    />
  )
}

export default Handler
