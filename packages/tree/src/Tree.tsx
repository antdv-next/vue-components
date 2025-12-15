import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'
import type { NodeDragEventParams, NodeMouseEventParams } from './contextTypes'
import type {
  BasicDataNode,
  DataNode,
  Direction,
  EventDataNode,
  FieldNames,
  FlattenNode,
  IconType,
  Key,
  KeyEntities,
  SafeKey,
} from './interface'
import { defineComponent, reactive, shallowRef } from 'vue'
import { fillFieldNames } from './utils/treeUtil'

const MAX_RETRY_TIMES = 10

export interface CheckInfo<TreeDataType extends BasicDataNode = DataNode> {
  event: 'check'
  node: EventDataNode<TreeDataType>
  checked: boolean
  nativeEvent: MouseEvent
  checkedNodes: TreeDataType[]
  checkedNodesPositions?: { node: TreeDataType, pos: string }[]
  halfCheckedKeys?: Key[]
}

export interface AllowDropOptions<TreeDataType extends BasicDataNode = DataNode> {
  dragNode: TreeDataType
  dropNode: TreeDataType
  dropPosition: -1 | 0 | 1
}
export type AllowDrop<TreeDataType extends BasicDataNode = DataNode> = (
  options: AllowDropOptions<TreeDataType>,
) => boolean

export type DraggableFn = (node: DataNode) => boolean
export interface DraggableConfig {
  icon?: VueNode | false
  nodeDraggable?: DraggableFn
}

export type ExpandAction = false | 'click' | 'doubleClick'

export type SemanticName = 'itemIcon' | 'item' | 'itemTitle'

export interface TreeProps<TreeDataType extends BasicDataNode = DataNode> {
  prefixCls: string
  className?: string
  style?: CSSProperties
  styles?: Partial<Record<SemanticName, CSSProperties>>
  classNames?: Partial<Record<SemanticName, string>>
  focusable?: boolean
  activeKey?: Key | null
  tabIndex?: number
  treeData?: TreeDataType[] // Generate treeNode by children
  fieldNames?: FieldNames
  showLine?: boolean
  showIcon?: boolean
  icon?: IconType
  selectable?: boolean
  expandAction?: ExpandAction
  disabled?: boolean
  multiple?: boolean
  checkable?: boolean | VueNode
  checkStrictly?: boolean
  draggable?: DraggableFn | boolean | DraggableConfig
  defaultExpandParent?: boolean
  autoExpandParent?: boolean
  defaultExpandAll?: boolean
  defaultExpandedKeys?: Key[]
  expandedKeys?: Key[]
  defaultCheckedKeys?: Key[]
  checkedKeys?: Key[] | { checked: Key[], halfChecked: Key[] }
  defaultSelectedKeys?: Key[]
  selectedKeys?: Key[]
  allowDrop?: AllowDrop<TreeDataType>
  titleRender?: (node: TreeDataType) => any
  onFocus?: (e: FocusEvent) => void
  onBlur?: (e: FocusEvent) => void
  onKeyDown?: (e: KeyboardEvent) => void
  onContextMenu?: (e: MouseEvent) => void
  onClick?: (e: MouseEvent) => void
  onDoubleClick?: (e: MouseEvent) => void
  onScroll?: (e: UIEvent) => void
  onExpand?: (expandedKeys: Key[], info: {
    node: EventDataNode<TreeDataType>
    expanded: boolean
    nativeEvent: MouseEvent
  }) => void
  onCheck?: (checked: { checked: Key[], halfChecked: Key[] } | Key[], info: CheckInfo<TreeDataType>) => void
  onSelect?: (
    selectedKeys: Key[],
    info: {
      event: 'select'
      selected: boolean
      node: EventDataNode<TreeDataType>
      selectedNodes: TreeDataType[]
      nativeEvent: MouseEvent
    },
  ) => void
  onLoad?: (
    loadKeys: Key[],
    info: {
      event: 'load'
      node: EventDataNode<TreeDataType>
    },
  ) => void
  loadData?: (treeNode: EventDataNode<TreeDataType>) => Promise<void>
  loadKeys?: Key[]
  onMouseEnter?: (info: NodeMouseEventParams<TreeDataType>) => void
  onMouseLeave?: (info: NodeMouseEventParams<TreeDataType>) => void
  onRightClick?: (info: { event: MouseEvent, node: EventDataNode<TreeDataType> }) => void
  onDragStart?: (info: NodeDragEventParams<TreeDataType>) => void
  onDragEnter?: (info: NodeDragEventParams<TreeDataType>) => void
  onDragOver?: (info: NodeDragEventParams<TreeDataType>) => void
  onDragLeave?: (info: NodeDragEventParams<TreeDataType>) => void
  onDragEnd?: (info: NodeDragEventParams<TreeDataType>) => void
  onDrop?: (info: NodeDragEventParams<TreeDataType> & {
    dragNode: EventDataNode<TreeDataType>
    dragNodeKeys: Key[]
    dropPosition: number
    dropToGap: boolean
  }) => void
  /**
   * Used for `rc-tree-select` only.
   * Do not use in your production code directly since this will be refactor.
   */
  onActiveChange?: (key: Key) => void
  filterTreeNode?: (treeNode: EventDataNode<TreeDataType>) => boolean
  motion?: any
  switcherIcon?: IconType

  // Virtual List
  height?: number
  itemHeight?: number
  scrollWidth?: number
  itemScrollOffset?: number
  virtual?: boolean

  // direction for drag logic
  direction?: Direction

  rootClassName?: string
  rootStyle?: CSSProperties

}

interface TreeState<TreeDataType extends BasicDataNode = DataNode> {
  keyEntities: KeyEntities<TreeDataType>
  indent: number | null

  selectedKeys: Key[]
  checkedKeys: Key[]
  halfCheckedKeys: Key[]
  loadedKeys: Key[]
  loadingKeys: Key[]
  expandedKeys: Key[]

  draggingNodeKey: Key | null
  dragChildrenKeys: Key[]

  // for details see comment in Tree.state
  dropPosition: -1 | 0 | 1 | null
  dropLevelOffset: number | null
  dropContainerKey: Key | null
  dropTargetKey: Key | null
  dropTargetPos: string | null
  dropAllowed: boolean
  dragOverNodeKey: Key | null

  treeData: TreeDataType[]
  flattenNodes: FlattenNode<TreeDataType>[]

  focused: boolean
  activeKey: Key | null

  // Record if list is changing
  listChanging: boolean

  prevProps: TreeProps | null

  fieldNames: FieldNames
}
const defaultProps = {
  prefixCls: 'vc-tree',
  showLine: false,
  showIcon: true,
  selectable: true,
  multiple: false,
  checkable: false,
  disabled: false,
  checkStrictly: false,
  draggable: false,
  defaultExpandParent: true,
  autoExpandParent: false,
  defaultExpandAll: false,
  defaultExpandedKeys: [],
  defaultCheckedKeys: [],
  defaultSelectedKeys: [],
  // dropIndicatorRender: DropIndicator,
  allowDrop: () => true,
  expandAction: false,
} as any

const Tree = defineComponent<TreeProps>(
  (props = defaultProps, { slots, attrs }) => {
    const destroyed = shallowRef(false)
    const delayDragEnterLogic = shallowRef<Record<SafeKey, number>>()
    const loadingRetryTimes = shallowRef<Record<SafeKey, number>>({})
    const state = reactive<TreeState>({
      keyEntities: {},

      indent: null,

      selectedKeys: [],
      checkedKeys: [],
      halfCheckedKeys: [],
      loadedKeys: [],
      loadingKeys: [],
      expandedKeys: [],

      draggingNodeKey: null,
      dragChildrenKeys: [],

      // dropTargetKey is the key of abstract-drop-node
      // the abstract-drop-node is the real drop node when drag and drop
      // not the DOM drag over node
      dropTargetKey: null,
      dropPosition: null, // the drop position of abstract-drop-node, inside 0, top -1, bottom 1
      dropContainerKey: null, // the container key of abstract-drop-node if dropPosition is -1 or 1
      dropLevelOffset: null, // the drop level offset of abstract-drag-over-node
      dropTargetPos: null, // the pos of abstract-drop-node
      dropAllowed: true, // if drop to abstract-drop-node is allowed
      // the abstract-drag-over-node
      // if mouse is on the bottom of top dom node or no the top of the bottom dom node
      // abstract-drag-over-node is the top node
      dragOverNodeKey: null,

      treeData: [],
      flattenNodes: [],

      focused: false,
      activeKey: null,

      listChanging: false,

      prevProps: null,

      fieldNames: fillFieldNames(),
    })
    return () => {
      return null
    }
  },
  {
    name: 'Tree',
    inheritAttrs: false,
  },
)

export default Tree
