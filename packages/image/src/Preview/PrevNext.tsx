import type { FunctionalComponent } from 'vue'
import type { OperationIcons } from '.'
import { classNames } from '@v-c/util'

export interface PrevNextProps {
  prefixCls: string
  onActive: (offset: number) => void
  current: number
  count: number
  icons: OperationIcons
}

const PrevNext: FunctionalComponent<PrevNextProps> = (props: PrevNextProps) => {
  const {
    prefixCls,
    onActive,
    current,
    count,
    icons: { left, right, prev, next },
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
        {prev ?? left}
      </div>
      <div
        class={classNames(switchCls, `${switchCls}-next`, {
          [`${switchCls}-disabled`]: current === count - 1,
        })}
        onClick={() => onActive(1)}
      >
        {next ?? right}
      </div>
    </>
  )
}

export default PrevNext
