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

      const prevDisabled = current === 0
      const nextDisabled = current === count - 1

      return (
        <>
          <button
            type='button'
            class={clsx(switchCls, `${switchCls}-prev`, {
              [`${switchCls}-disabled`]: prevDisabled,
            })}
            onClick={() => {
              if (!prevDisabled) {
                onActive(-1)
              }
            }}
          >
            {prevIcon}
          </button>
          <button
            type='button'
            class={clsx(switchCls, `${switchCls}-next`, {
              [`${switchCls}-disabled`]: nextDisabled,
            })}
            onClick={() => {
              if (!nextDisabled) {
                onActive(1)
              }
            }}
          >
            {nextIcon}
          </button>
        </>
      )
    }
  },
  { name: 'ImagePreviewPrevNext' },
)

export default PrevNext
