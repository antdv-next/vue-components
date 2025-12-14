import type { VueNode } from '@v-c/util/dist/type'
import { defineComponent } from 'vue'

export interface CloseBtnProps {
  prefixCls: string
  icon?: VueNode
  onClick: (e: MouseEvent) => void
}

const CloseBtn = defineComponent<CloseBtnProps>(
  (props) => {
    return () => {
      const { prefixCls, icon, onClick } = props
      return (
        <button class={`${prefixCls}-close`} type="button" onClick={onClick}>
          {icon}
        </button>
      )
    }
  },
  { name: 'ImagePreviewCloseBtn' },
)

export default CloseBtn
