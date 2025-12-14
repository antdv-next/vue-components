import type { VueNode } from '@v-c/util/dist/type'
import type { OperationIcons } from './index'
import { clsx } from '@v-c/util'
import { defineComponent } from 'vue'

export interface PrevNextProps {
  prefixCls: string
  onActive: (offset: number) => void
  current: number
  count: number
  icons: OperationIcons
}

const PrevNext = defineComponent<PrevNextProps>(
  (props) => {
    return () => {
      const { prefixCls, onActive, current, count, icons } = props
      const switchCls = `${prefixCls}-switch`

      const prevIcon = (icons.prev ?? icons.left) as VueNode
      const nextIcon = (icons.next ?? icons.right) as VueNode

      const isPrevDisabled = current === 0
      const isNextDisabled = current === count - 1

      return (
        <>
          <div
            class={clsx(switchCls, `${switchCls}-prev`, {
              [`${switchCls}-disabled`]: isPrevDisabled,
            })}
            onClick={() => {
              if (!isPrevDisabled) {
                onActive(-1)
              }
            }}
          >
            {prevIcon}
          </div>
          <div
            class={clsx(switchCls, `${switchCls}-next`, {
              [`${switchCls}-disabled`]: isNextDisabled,
            })}
            onClick={() => {
              if (!isNextDisabled) {
                onActive(1)
              }
            }}
          >
            {nextIcon}
          </div>
        </>
      )
    }
  },
  { name: 'ImagePreviewPrevNext' },
)

export default PrevNext
