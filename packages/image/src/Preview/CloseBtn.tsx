import type { FunctionalComponent, VNode } from 'vue'

export interface CloseBtnProps {
  prefixCls: string
  onClick: (e: MouseEvent) => void
  icon?: VNode
}

const CloseBtn: FunctionalComponent<CloseBtnProps> = (props) => {
  const { prefixCls, onClick, icon } = props

  return (
    <button class={`${prefixCls}-close`} onClick={onClick}>
      {icon}
    </button>
  )
}

export default CloseBtn
