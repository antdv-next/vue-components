import type { MouseEventHandler } from '@v-c/util/dist/EventInterface'
import type { Key, VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'

export interface TreeNodeProps {
  eventKey?: Key // Pass by parent `cloneElement`
  prefixCls?: string
  className?: string
  id?: string

  // By parent
  expanded?: boolean
  selected?: boolean
  checked?: boolean
  loaded?: boolean
  loading?: boolean
  halfChecked?: boolean

  title?: VueNode | ((data: BasicDataNode) => any)
  dragOver?: boolean
  dragOverGapTop?: boolean
  dragOverGapBottom?: boolean
  pos?: string
  domRef?: HTMLDivElement
  /** New added in Tree for easy data access */
  data?: BasicDataNode
  isStart?: boolean[]
  isEnd?: boolean[]
  active?: boolean
  onMouseMove?: MouseEventHandler

  // By user
  isLeaf?: boolean
  checkable?: boolean
  selectable?: boolean
  disabled?: boolean
  disableCheckbox?: boolean
  icon?: IconType
  switcherIcon?: IconType
}

export type IconType = VueNode | ((props: TreeNodeProps) => VueNode)

/** For fieldNames, we provides a abstract interface */
export interface BasicDataNode {
  checkable?: boolean
  disabled?: boolean
  disableCheckbox?: boolean
  icon?: IconType
  isLeaf?: boolean
  selectable?: boolean
  switcherIcon?: IconType

  /** Set style of TreeNode. This is not recommend if you don't have any force requirement */
  className?: string
  style?: CSSProperties
  [key: string]: any
}
