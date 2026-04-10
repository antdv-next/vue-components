import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'
import { clsx } from '@v-c/util'
import { defineComponent } from 'vue'

export interface CloseBtnProps {
  prefixCls: string
  icon?: VueNode
  onClick: (e: MouseEvent) => void
  className?: string
  style?: CSSProperties
}

const CloseBtn = defineComponent<CloseBtnProps>(
  (props) => {
    return () => {
      const { prefixCls, icon, onClick, className, style } = props
      return (
        <button class={clsx(`${prefixCls}-close`, className)} style={style} type="button" onClick={onClick}>
          {icon}
        </button>
      )
    }
  },
  { name: 'ImagePreviewCloseBtn' },
)

export default CloseBtn
