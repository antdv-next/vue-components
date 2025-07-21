import type { FunctionalComponent } from 'vue'
import type { OperationIcons } from '.'
import classNames from 'classnames'

export interface PrevNextProps {
  prefixCls: string
  onActive: (offset: number) => void
  current: number
  count: number
  icons: OperationIcons
}

const PrevNext: FunctionalComponent<PrevNextProps> = (props: PrevNextProps, { slots }) => {
  const {
    prefixCls,
    onActive,
    current,
    count,
  } = props

  const switchCls = `${prefixCls}-switch`

  return (
    <>
      <div
        class={classNames(switchCls, `${switchCls}-prev`, {
          [`${switchCls}-disabled`]: current === 0,
        })}
        onClick={() => onActive(-1)}
      >
        {slots.prev?.() ?? slots.left?.()}
      </div>
      <div
        class={classNames(switchCls, `${switchCls}-next`, {
          [`${switchCls}-disabled`]: current === count - 1,
        })}
        onClick={() => onActive(1)}
      >
        {slots.next?.() ?? slots.right?.()}
      </div>
    </>
  )
}

export default PrevNext
