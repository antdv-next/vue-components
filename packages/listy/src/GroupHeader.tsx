import type { CSSProperties } from 'vue'
import type { Group } from './interface'
import { clsx } from '@v-c/util'
import { defineComponent } from 'vue'

// ============================== Types ===============================
export interface GroupHeaderProps {
  group: Group
  groupKey: any
  groupItems: any[]
  prefixCls: string
  fixed?: boolean
  sticky?: boolean
  className?: string
  style?: CSSProperties
}

export default defineComponent<GroupHeaderProps>((props) => {
  return () => {
    const {
      group,
      groupKey,
      groupItems,
      prefixCls,
      fixed,
      sticky,
      className: customClassName,
      style,
    } = props

    const className = clsx(
      `${prefixCls}-group-header`,
      {
        [`${prefixCls}-group-header-sticky`]: sticky,
        [`${prefixCls}-group-header-fixed`]: fixed,
      },
      customClassName,
    )
    return (
      <div class={className} style={style}>
        {group.title(groupKey, groupItems)}
      </div>
    )
  }
})
