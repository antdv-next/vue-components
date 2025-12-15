import type { CSSProperties, PropType } from 'vue'
import type {
  DraggableConfig,
  NodeDragEventHandler,
  NodeMouseEventHandler,
  TreeContextProps,
} from './contextTypes'
import type {
  BasicDataNode,
  DataNode,
  Direction,
  EventDataNode,
  FieldNames,
  IconType,
  Key,
  KeyEntities,
  ScrollTo,
  TreeNodeProps,
} from './interface'
import type { NodeListRef } from './NodeList'
import { clsx } from '@v-c/util'
import useMergedState from '@v-c/util/dist/hooks/useMergedState'
import KeyCode from '@v-c/util/dist/KeyCode'
import pickAttrs from '@v-c/util/dist/pickAttrs'
import warning from '@v-c/util/dist/warning'
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  provide,
  reactive,
  ref,
  watchEffect,
} from 'vue'
import { TreeContextKey } from './contextTypes'
import DropIndicator from './DropIndicator'
import NodeList from './NodeList'
import TreeNode from './TreeNode'
import {
  arrAdd,
  arrDel,
  calcDropPosition,
  calcSelectedKeys,
  conductExpandParent,
  getDragChildrenKeys,
  parseCheckedKeys,
  posToArr,
} from './util'
import { conductCheck } from './utils/conductUtil'
import getEntity from './utils/keyUtil'
import {
  convertDataToEntities,
  convertNodePropsToEventData,
  convertTreeToData,
  fillFieldNames,
  flattenTreeData,
  getTreeNodeProps,
  warningWithoutKey,
} from './utils/treeUtil'

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

export type ExpandAction = false | 'click' | 'doubleClick'

export type DraggableFn = (node: DataNode) => boolean
export type DraggableUnion = DraggableFn | boolean | DraggableConfig

export interface TreeProps<TreeDataType extends BasicDataNode = DataNode> {
  prefixCls?: string
  className?: string
  style?: CSSProperties
  styles?: Partial<Record<'itemIcon' | 'item' | 'itemTitle', CSSProperties>>
  classNames?: Partial<Record<'itemIcon' | 'item' | 'itemTitle', string>>
  focusable?: boolean
  activeKey?: Key | null
  tabIndex?: number
  treeData?: TreeDataType[]
  fieldNames?: FieldNames
  showLine?: boolean
  showIcon?: boolean
  icon?: IconType
  selectable?: boolean
  expandAction?: ExpandAction
  disabled?: boolean
  multiple?: boolean
  checkable?: boolean | any
  checkStrictly?: boolean
  draggable?: DraggableUnion
  defaultExpandParent?: boolean
  autoExpandParent?: boolean
  defaultExpandAll?: boolean
  defaultExpandedKeys?: Key[]
  expandedKeys?: Key[]
  defaultCheckedKeys?: Key[]
  checkedKeys?: Key[] | { checked: Key[], halfChecked: Key[] }
  defaultSelectedKeys?: Key[]
  selectedKeys?: Key[]
  allowDrop?: (options: { dragNode: TreeDataType, dropNode: TreeDataType, dropPosition: -1 | 0 | 1 }) => boolean
  titleRender?: (node: TreeDataType) => any
  dropIndicatorRender?: (props: {
    dropPosition: -1 | 0 | 1
    dropLevelOffset: number
    indent: number
    prefixCls: string
    direction: Direction
  }) => any
  onFocus?: (e: FocusEvent) => void
  onBlur?: (e: FocusEvent) => void
  onKeyDown?: (e: KeyboardEvent) => void
  onContextMenu?: (e: MouseEvent) => void
  onClick?: NodeMouseEventHandler<TreeDataType>
  onDoubleClick?: NodeMouseEventHandler<TreeDataType>
  onScroll?: (e: Event) => void
  onExpand?: (
    expandedKeys: Key[],
    info: { node: EventDataNode<TreeDataType>, expanded: boolean, nativeEvent: MouseEvent },
  ) => void
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
  onLoad?: (loadedKeys: Key[], info: { event: 'load', node: EventDataNode<TreeDataType> }) => void
  loadData?: (treeNode: EventDataNode<TreeDataType>) => Promise<any>
  loadedKeys?: Key[]
  onMouseEnter?: (info: { event: MouseEvent, node: EventDataNode<TreeDataType> }) => void
  onMouseLeave?: (info: { event: MouseEvent, node: EventDataNode<TreeDataType> }) => void
  onRightClick?: (info: { event: MouseEvent, node: EventDataNode<TreeDataType> }) => void
  onDragStart?: (info: { event: DragEvent, node: EventDataNode<TreeDataType> }) => void
  onDragEnter?: (info: { event: DragEvent, node: EventDataNode<TreeDataType>, expandedKeys: Key[] }) => void
  onDragOver?: (info: { event: DragEvent, node: EventDataNode<TreeDataType> }) => void
  onDragLeave?: (info: { event: DragEvent, node: EventDataNode<TreeDataType> }) => void
  onDragEnd?: (info: { event: DragEvent, node: EventDataNode<TreeDataType> }) => void
  onDrop?: (info: {
    event: DragEvent
    node: EventDataNode<TreeDataType>
    dragNode: EventDataNode<TreeDataType>
    dragNodesKeys: Key[]
    dropPosition: number
    dropToGap: boolean
  }) => void
  onActiveChange?: (key: Key | null) => void
  filterTreeNode?: (treeNode: EventDataNode<TreeDataType>) => boolean
  motion?: any
  switcherIcon?: IconType

  height?: number
  itemHeight?: number
  scrollWidth?: number
  itemScrollOffset?: number
  virtual?: boolean

  direction?: Direction

  rootClassName?: string
  rootStyle?: CSSProperties
}

export interface TreeRef {
  scrollTo: ScrollTo
}

export default defineComponent({
  name: 'Tree',
  props: {
    prefixCls: { type: String, default: 'vc-tree' },
    className: String,
    style: Object as PropType<CSSProperties>,
    styles: Object as PropType<TreeProps['styles']>,
    classNames: Object as PropType<TreeProps['classNames']>,
    focusable: { type: Boolean, default: true },
    activeKey: [String, Number] as PropType<Key | null>,
    tabIndex: { type: Number, default: 0 },
    treeData: Array as PropType<any[]>,
    fieldNames: Object as PropType<FieldNames>,
    showLine: { type: Boolean, default: false },
    showIcon: { type: Boolean, default: true },
    icon: [String, Number, Object, Function] as PropType<IconType>,
    selectable: { type: Boolean, default: true },
    expandAction: [Boolean, String] as PropType<ExpandAction>,
    disabled: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false },
    checkable: { type: [Boolean, String, Number, Object] as PropType<boolean | any>, default: false },
    checkStrictly: { type: Boolean, default: false },
    draggable: [Boolean, Function, Object] as PropType<DraggableUnion>,
    defaultExpandParent: { type: Boolean, default: true },
    autoExpandParent: { type: Boolean, default: false },
    defaultExpandAll: { type: Boolean, default: false },
    defaultExpandedKeys: { type: Array as PropType<Key[]>, default: () => [] },
    expandedKeys: Array as PropType<Key[]>,
    defaultCheckedKeys: { type: Array as PropType<Key[]>, default: () => [] },
    checkedKeys: [Array, Object] as PropType<any>,
    defaultSelectedKeys: { type: Array as PropType<Key[]>, default: () => [] },
    selectedKeys: Array as PropType<Key[]>,
    allowDrop: { type: Function as PropType<any>, default: () => true },
    titleRender: Function as PropType<any>,
    dropIndicatorRender: Function as PropType<any>,
    onFocus: Function as PropType<(e: FocusEvent) => void>,
    onBlur: Function as PropType<(e: FocusEvent) => void>,
    onKeyDown: Function as PropType<(e: KeyboardEvent) => void>,
    onContextMenu: Function as PropType<(e: MouseEvent) => void>,
    onClick: Function as PropType<any>,
    onDoubleClick: Function as PropType<any>,
    onScroll: Function as PropType<(e: Event) => void>,
    onExpand: Function as PropType<any>,
    onCheck: Function as PropType<any>,
    onSelect: Function as PropType<any>,
    onLoad: Function as PropType<any>,
    loadData: Function as PropType<any>,
    loadedKeys: Array as PropType<Key[]>,
    onMouseEnter: Function as PropType<any>,
    onMouseLeave: Function as PropType<any>,
    onRightClick: Function as PropType<any>,
    onDragStart: Function as PropType<any>,
    onDragEnter: Function as PropType<any>,
    onDragOver: Function as PropType<any>,
    onDragLeave: Function as PropType<any>,
    onDragEnd: Function as PropType<any>,
    onDrop: Function as PropType<any>,
    onActiveChange: Function as PropType<(key: Key | null) => void>,
    filterTreeNode: Function as PropType<any>,
    motion: null as any,
    switcherIcon: [String, Number, Object, Function] as PropType<IconType>,
    height: Number,
    itemHeight: Number,
    scrollWidth: Number,
    itemScrollOffset: Number,
    virtual: { type: Boolean, default: true },
    direction: String as PropType<Direction>,
    rootClassName: String,
    rootStyle: Object as PropType<CSSProperties>,
  },
  setup(props, { slots, attrs, expose }) {
    const mergedFieldNames = computed(() => fillFieldNames(props.fieldNames))

    const mergedTreeData = computed(() => {
      if (props.treeData) {
        return props.treeData
      }
      return convertTreeToData(slots.default?.())
    })

    watchEffect(() => {
      warningWithoutKey(mergedTreeData.value as any, mergedFieldNames.value)
    })

    const entities = computed(() => convertDataToEntities(mergedTreeData.value as any, { fieldNames: mergedFieldNames.value }))
    const keyEntities = computed(() => entities.value.keyEntities as KeyEntities)

    const controlledExpandedKeys = computed(() => {
      if (props.expandedKeys === undefined) {
        return undefined
      }
      const keys = props.expandedKeys || []
      if (props.autoExpandParent) {
        return conductExpandParent(keys, keyEntities.value)
      }
      return keys
    })

    const [expandedKeys, setExpandedKeys] = useMergedState<Key[]>(
      () => {
        let keys: Key[] = []
        if (props.defaultExpandAll) {
          keys = Object.values(keyEntities.value).map(entity => entity.key)
        }
        else {
          keys = props.defaultExpandedKeys || []
        }
        if (props.defaultExpandParent) {
          keys = conductExpandParent(keys, keyEntities.value)
        }
        return keys
      },
      {
        value: controlledExpandedKeys as any,
      },
    )

    const flattenNodes = computed(() => flattenTreeData(mergedTreeData.value as any, expandedKeys.value, mergedFieldNames.value))

    const controlledSelectedKeys = computed(() => {
      if (props.selectedKeys === undefined) {
        return undefined
      }
      return calcSelectedKeys(props.selectedKeys, props as any) || []
    })

    const [selectedKeys, setSelectedKeys] = useMergedState<Key[]>(
      () => calcSelectedKeys(props.defaultSelectedKeys || [], props as any) || [],
      {
        value: controlledSelectedKeys as any,
      },
    )

    const controlledCheckedKeys = computed(() => {
      if (props.checkedKeys === undefined) {
        return undefined
      }
      return parseCheckedKeys(props.checkedKeys as any)?.checkedKeys || []
    })

    const [rawCheckedKeys, setRawCheckedKeys] = useMergedState<Key[]>(
      () => (props.defaultCheckedKeys || []),
      {
        value: controlledCheckedKeys as any,
      },
    )

    const controlledHalfCheckedKeys = computed(() => {
      if (props.checkedKeys === undefined) {
        return undefined
      }
      return parseCheckedKeys(props.checkedKeys as any)?.halfCheckedKeys || []
    })

    const [rawHalfCheckedKeys, setRawHalfCheckedKeys] = useMergedState<Key[]>(
      () => [],
      {
        value: controlledHalfCheckedKeys as any,
      },
    )

    const mergedChecked = computed(() => {
      if (!props.checkable) {
        return { checkedKeys: [] as Key[], halfCheckedKeys: [] as Key[] }
      }

      let checkedKeysValue = rawCheckedKeys.value || []
      let halfCheckedKeysValue = rawHalfCheckedKeys.value || []

      if (!props.checkStrictly) {
        const conductKeys = conductCheck(checkedKeysValue, true, keyEntities.value as any)
        checkedKeysValue = conductKeys.checkedKeys
        halfCheckedKeysValue = conductKeys.halfCheckedKeys
      }

      return { checkedKeys: checkedKeysValue, halfCheckedKeys: halfCheckedKeysValue }
    })

    const controlledLoadedKeys = computed(() => (props.loadedKeys === undefined ? undefined : props.loadedKeys))
    const [loadedKeys, setLoadedKeys] = useMergedState<Key[]>(() => [], { value: controlledLoadedKeys as any })

    const loadingKeys = ref<Key[]>([])

    const focused = ref(false)
    const controlledActiveKey = computed(() => (props.activeKey === undefined ? undefined : props.activeKey))
    const [activeKey, setActiveKey] = useMergedState<Key | null>(null, { value: controlledActiveKey as any })

    const draggingNodeKey = ref<Key | null>(null)
    const dragChildrenKeys = ref<Key[]>([])
    const indent = ref<number | null>(null)

    const dropTargetKey = ref<Key | null>(null)
    const dropPosition = ref<-1 | 0 | 1 | null>(null)
    const dropContainerKey = ref<Key | null>(null)
    const dropLevelOffset = ref<number | null>(null)
    const dropTargetPos = ref<string | null>(null)
    const dropAllowed = ref(true)
    const dragOverNodeKey = ref<Key | null>(null)

    // Non-reactive drag vars
    let dragNodeProps: TreeNodeProps<any> | null = null
    let dragStartMousePosition: { x: number, y: number } | null = null
    let currentMouseOverDroppableNodeKey: Key | null = null
    const delayedDragEnterLogic: Record<string, number> = {}
    const loadingRetryTimes: Record<string, number> = {}

    const listRef = ref<NodeListRef>()

    const getTreeNodeRequiredProps = computed(() => ({
      expandedKeys: expandedKeys.value || [],
      selectedKeys: selectedKeys.value || [],
      loadedKeys: loadedKeys.value || [],
      loadingKeys: loadingKeys.value || [],
      checkedKeys: mergedChecked.value.checkedKeys || [],
      halfCheckedKeys: mergedChecked.value.halfCheckedKeys || [],
      dragOverNodeKey: dragOverNodeKey.value as any,
      dropPosition: dropPosition.value as any,
      keyEntities: keyEntities.value,
    }))

    const getActiveItem = computed(() => {
      if (activeKey.value === null) {
        return null
      }
      return flattenNodes.value.find(({ key }) => key === activeKey.value) || null
    })

    const scrollTo: ScrollTo = (scroll) => {
      listRef.value?.scrollTo(scroll)
    }

    expose({ scrollTo } satisfies TreeRef)

    function onActiveChange(newActiveKey: Key | null) {
      if (activeKey.value === newActiveKey) {
        return
      }

      setActiveKey(newActiveKey)
      if (newActiveKey !== null) {
        scrollTo({ key: newActiveKey, offset: props.itemScrollOffset || 0 })
      }
      props.onActiveChange?.(newActiveKey)
    }

    function offsetActiveKey(offset: number) {
      const nodes = flattenNodes.value
      const currentActiveKey = activeKey.value

      let index = nodes.findIndex(({ key }) => key === currentActiveKey)
      if (index === -1 && offset < 0) {
        index = nodes.length
      }

      index = (index + offset + nodes.length) % nodes.length
      const item = nodes[index]
      onActiveChange(item ? item.key : null)
    }

    function onFocus(e: FocusEvent) {
      focused.value = true
      props.onFocus?.(e)
    }

    function onBlur(e: FocusEvent) {
      focused.value = false
      onActiveChange(null)
      props.onBlur?.(e)
    }

    let onNodeExpand: NodeMouseEventHandler<any>

    function onKeyDown(e: KeyboardEvent) {
      switch (e.which || e.keyCode) {
        case KeyCode.UP:
          offsetActiveKey(-1)
          e.preventDefault()
          break
        case KeyCode.DOWN:
          offsetActiveKey(1)
          e.preventDefault()
          break
      }

      const activeItem = getActiveItem.value
      if (activeItem && activeItem.data) {
        const required = getTreeNodeRequiredProps.value
        const expandable
          = (activeItem.data as any).isLeaf === false
            || !!(((activeItem.data as any)[mergedFieldNames.value.children] || []) as any[]).length

        const eventNode = convertNodePropsToEventData<any>({
          ...(getTreeNodeProps(activeKey.value as any, required as any) as any),
          data: activeItem.data,
          active: true,
        })

        switch (e.which || e.keyCode) {
          case KeyCode.LEFT:
            if (expandable && expandedKeys.value.includes(activeKey.value as any)) {
              onNodeExpand({} as any, eventNode)
            }
            else if (activeItem.parent) {
              onActiveChange(activeItem.parent.key)
            }
            e.preventDefault()
            break
          case KeyCode.RIGHT:
            if (expandable && !expandedKeys.value.includes(activeKey.value as any)) {
              onNodeExpand({} as any, eventNode)
            }
            else if (activeItem.children && activeItem.children.length) {
              onActiveChange(activeItem.children[0].key)
            }
            e.preventDefault()
            break
          case KeyCode.ENTER:
          case KeyCode.SPACE:
            if (
              props.checkable
              && !eventNode.disabled
              && eventNode.checkable !== false
              && !eventNode.disableCheckbox
            ) {
              onNodeCheck({} as any, eventNode, !mergedChecked.value.checkedKeys.includes(activeKey.value as any))
            }
            else if (
              !props.checkable
              && props.selectable
              && !eventNode.disabled
              && eventNode.selectable !== false
            ) {
              onNodeSelect({} as any, eventNode)
            }
            break
        }
      }

      props.onKeyDown?.(e)
    }

    function onNodeLoad(treeNode: EventDataNode<any>) {
      const key = treeNode.key
      const entity = getEntity(keyEntities.value as any, key)
      if (entity?.children?.length) {
        return undefined
      }

      const loadData = props.loadData
      if (!loadData || loadedKeys.value.includes(key) || loadingKeys.value.includes(key)) {
        return undefined
      }

      loadingKeys.value = arrAdd(loadingKeys.value, key)

      const promise = loadData(treeNode)
      const wrapped = Promise.resolve(promise)
        .then(() => {
          const newLoadedKeys = arrAdd(loadedKeys.value, key)

          props.onLoad?.(newLoadedKeys, {
            event: 'load',
            node: treeNode,
          })

          setLoadedKeys(newLoadedKeys)
          loadingKeys.value = arrDel(loadingKeys.value, key)
        })
        .catch((err) => {
          loadingKeys.value = arrDel(loadingKeys.value, key)

          loadingRetryTimes[String(key)] = (loadingRetryTimes[String(key)] || 0) + 1
          if (loadingRetryTimes[String(key)] >= MAX_RETRY_TIMES) {
            warning(false, 'Retry for `loadData` many times but still failed. No more retry.')
            setLoadedKeys(arrAdd(loadedKeys.value, key))
            return
          }

          throw err
        })

      // avoid unhandled
      wrapped.catch(() => {})
      return wrapped
    }

    onNodeExpand = (e, treeNode) => {
      const expanded = treeNode.expanded
      const key = (treeNode as any)[mergedFieldNames.value.key]
      const targetExpanded = !expanded

      const certain = expandedKeys.value.includes(key)
      warning((expanded && certain) || (!expanded && !certain), 'Expand state not sync with index check')

      const nextExpandedKeys = targetExpanded ? arrAdd(expandedKeys.value, key) : arrDel(expandedKeys.value, key)
      setExpandedKeys(nextExpandedKeys)

      props.onExpand?.(nextExpandedKeys, {
        node: treeNode,
        expanded: targetExpanded,
        nativeEvent: e,
      })

      if (targetExpanded && props.loadData) {
        const loadPromise = onNodeLoad(treeNode)
        if (loadPromise) {
          loadPromise.catch(() => {
            setExpandedKeys(arrDel(expandedKeys.value, key))
          })
        }
      }
    }

    const triggerExpandActionExpand: NodeMouseEventHandler<any> = (e, treeNode) => {
      const expanded = treeNode.expanded
      const key = treeNode.key
      const isLeaf = (treeNode as any).isLeaf

      if (isLeaf || (e as any).shiftKey || (e as any).metaKey || (e as any).ctrlKey) {
        return
      }

      const node = flattenNodes.value.find(nodeItem => nodeItem.key === key)
      if (!node) {
        return
      }

      const eventNode = convertNodePropsToEventData<any>({
        ...(getTreeNodeProps(key, getTreeNodeRequiredProps.value as any) as any),
        data: node.data,
      })

      setExpandedKeys(expanded ? arrDel(expandedKeys.value, key) : arrAdd(expandedKeys.value, key))
      onNodeExpand(e, eventNode)
    }

    const onNodeClick: NodeMouseEventHandler<any> = (e, treeNode) => {
      if (props.expandAction === 'click') {
        triggerExpandActionExpand(e, treeNode)
      }
      props.onClick?.(e, treeNode)
    }

    const onNodeDoubleClick: NodeMouseEventHandler<any> = (e, treeNode) => {
      if (props.expandAction === 'doubleClick') {
        triggerExpandActionExpand(e, treeNode)
      }
      props.onDoubleClick?.(e, treeNode)
    }

    const onNodeSelect: NodeMouseEventHandler<any> = (e, treeNode) => {
      const selected = treeNode.selected
      const key = (treeNode as any)[mergedFieldNames.value.key]
      const targetSelected = !selected

      let nextSelectedKeys = selectedKeys.value
      if (!targetSelected) {
        nextSelectedKeys = arrDel(nextSelectedKeys, key)
      }
      else if (!props.multiple) {
        nextSelectedKeys = [key]
      }
      else {
        nextSelectedKeys = arrAdd(nextSelectedKeys, key)
      }

      const selectedNodes = nextSelectedKeys
        .map((selectedKey) => {
          const entity = getEntity(keyEntities.value as any, selectedKey)
          return entity ? entity.node : null
        })
        .filter(Boolean)

      setSelectedKeys(nextSelectedKeys)

      props.onSelect?.(nextSelectedKeys, {
        event: 'select',
        selected: targetSelected,
        node: treeNode,
        selectedNodes,
        nativeEvent: e,
      })
    }

    const onNodeCheck = (e: MouseEvent, treeNode: EventDataNode<any>, checked: boolean) => {
      const { checkedKeys: oriCheckedKeys, halfCheckedKeys: oriHalfCheckedKeys } = mergedChecked.value
      const key = treeNode.key

      let checkedObj: { checked: Key[], halfChecked: Key[] } | Key[]

      const eventObj: any = {
        event: 'check',
        node: treeNode,
        checked,
        nativeEvent: e,
      }

      if (props.checkStrictly) {
        const nextCheckedKeys = checked ? arrAdd(oriCheckedKeys, key) : arrDel(oriCheckedKeys, key)
        const nextHalfCheckedKeys = arrDel(oriHalfCheckedKeys, key)
        checkedObj = { checked: nextCheckedKeys, halfChecked: nextHalfCheckedKeys }

        eventObj.checkedNodes = nextCheckedKeys
          .map(checkedKey => getEntity(keyEntities.value as any, checkedKey))
          .filter(Boolean)
          .map(entity => entity.node)

        setRawCheckedKeys(nextCheckedKeys)
        setRawHalfCheckedKeys(nextHalfCheckedKeys)
      }
      else {
        let { checkedKeys: nextCheckedKeys, halfCheckedKeys: nextHalfCheckedKeys } = conductCheck(
          [...oriCheckedKeys, key],
          true,
          keyEntities.value as any,
        )

        if (!checked) {
          const keySet = new Set(nextCheckedKeys)
          keySet.delete(key)
          ;({ checkedKeys: nextCheckedKeys, halfCheckedKeys: nextHalfCheckedKeys } = conductCheck(
            Array.from(keySet),
            { checked: false, halfCheckedKeys: nextHalfCheckedKeys },
            keyEntities.value as any,
          ))
        }

        checkedObj = nextCheckedKeys

        eventObj.checkedNodes = []
        eventObj.checkedNodesPositions = []
        eventObj.halfCheckedKeys = nextHalfCheckedKeys

        nextCheckedKeys.forEach((checkedKey) => {
          const entity = getEntity(keyEntities.value as any, checkedKey)
          if (!entity)
            return
          const { node, pos } = entity
          eventObj.checkedNodes.push(node)
          eventObj.checkedNodesPositions.push({ node, pos })
        })

        setRawCheckedKeys(nextCheckedKeys)
        setRawHalfCheckedKeys(nextHalfCheckedKeys)
      }

      props.onCheck?.(checkedObj, eventObj as CheckInfo<any>)
    }

    const onNodeMouseEnter: NodeMouseEventHandler<any> = (e, node) => {
      props.onMouseEnter?.({ event: e, node })
    }

    const onNodeMouseLeave: NodeMouseEventHandler<any> = (e, node) => {
      props.onMouseLeave?.({ event: e, node })
    }

    const onNodeContextMenu: NodeMouseEventHandler<any> = (e, node) => {
      if (props.onRightClick) {
        e.preventDefault()
        props.onRightClick({ event: e, node })
      }
    }

    function resetDragState() {
      dragOverNodeKey.value = null
      dropPosition.value = null
      dropLevelOffset.value = null
      dropTargetKey.value = null
      dropContainerKey.value = null
      dropTargetPos.value = null
      dropAllowed.value = false
    }

    function cleanDragState() {
      if (draggingNodeKey.value !== null) {
        draggingNodeKey.value = null
        dropPosition.value = null
        dropContainerKey.value = null
        dropTargetKey.value = null
        dropLevelOffset.value = null
        dropAllowed.value = true
        dragOverNodeKey.value = null
      }
      dragStartMousePosition = null
      currentMouseOverDroppableNodeKey = null
      dragChildrenKeys.value = []
      indent.value = null
    }

    const onWindowDragEnd = (event: DragEvent) => {
      onNodeDragEnd(event, null as any, true)
      window.removeEventListener('dragend', onWindowDragEnd)
    }

    onBeforeUnmount(() => {
      window.removeEventListener('dragend', onWindowDragEnd)
      Object.keys(delayedDragEnterLogic).forEach((key) => {
        clearTimeout(delayedDragEnterLogic[key])
      })
    })

    const onNodeDragStart: NodeDragEventHandler<any> = (event, nodeProps) => {
      dragNodeProps = nodeProps
      dragStartMousePosition = { x: event.clientX, y: event.clientY }

      const newExpandedKeys = arrDel(expandedKeys.value, nodeProps.eventKey!)

      draggingNodeKey.value = nodeProps.eventKey!
      dragChildrenKeys.value = getDragChildrenKeys(nodeProps.eventKey!, keyEntities.value as any)
      indent.value = listRef.value?.getIndentWidth() || 0

      setExpandedKeys(newExpandedKeys)

      window.addEventListener('dragend', onWindowDragEnd)

      props.onDragStart?.({ event, node: convertNodePropsToEventData<any>(nodeProps) })
    }

    const onNodeDragEnter: NodeDragEventHandler<any> = (event, nodeProps) => {
      const { pos, eventKey } = nodeProps
      if (currentMouseOverDroppableNodeKey !== eventKey) {
        currentMouseOverDroppableNodeKey = eventKey!
      }

      if (!dragNodeProps || !dragStartMousePosition) {
        resetDragState()
        return
      }

      const {
        dropPosition: nextDropPosition,
        dropLevelOffset: nextDropLevelOffset,
        dropTargetKey: nextDropTargetKey,
        dropContainerKey: nextDropContainerKey,
        dropTargetPos: nextDropTargetPos,
        dropAllowed: nextDropAllowed,
        dragOverNodeKey: nextDragOverNodeKey,
      } = calcDropPosition<any>(
        event,
        dragNodeProps as any,
        nodeProps as any,
        indent.value || 0,
        dragStartMousePosition,
        props.allowDrop as any,
        flattenNodes.value as any,
        keyEntities.value as any,
        expandedKeys.value,
        props.direction,
      )

      if (dragChildrenKeys.value.includes(nextDropTargetKey) || !nextDropAllowed) {
        resetDragState()
        return
      }

      Object.keys(delayedDragEnterLogic).forEach((key) => {
        clearTimeout(delayedDragEnterLogic[key])
      })

      if (dragNodeProps.eventKey !== nodeProps.eventKey) {
        delayedDragEnterLogic[pos!] = window.setTimeout(() => {
          if (draggingNodeKey.value === null) {
            return
          }

          let newExpandedKeys = [...expandedKeys.value]
          const entity = getEntity(keyEntities.value as any, nodeProps.eventKey!)

          if (entity && (entity.children || []).length) {
            newExpandedKeys = arrAdd(expandedKeys.value, nodeProps.eventKey!)
          }

          if (props.expandedKeys === undefined) {
            setExpandedKeys(newExpandedKeys)
          }

          props.onExpand?.(newExpandedKeys, {
            node: convertNodePropsToEventData<any>(nodeProps as any),
            expanded: true,
            nativeEvent: event,
          })
        }, 800)
      }

      if (dragNodeProps.eventKey === nextDropTargetKey && nextDropLevelOffset === 0) {
        resetDragState()
        return
      }

      dragOverNodeKey.value = nextDragOverNodeKey
      dropPosition.value = nextDropPosition
      dropLevelOffset.value = nextDropLevelOffset
      dropTargetKey.value = nextDropTargetKey
      dropContainerKey.value = nextDropContainerKey
      dropTargetPos.value = nextDropTargetPos
      dropAllowed.value = nextDropAllowed

      props.onDragEnter?.({
        event,
        node: convertNodePropsToEventData<any>(nodeProps as any),
        expandedKeys: expandedKeys.value,
      })
    }

    const onNodeDragOver: NodeDragEventHandler<any> = (event, nodeProps) => {
      if (!dragNodeProps || !dragStartMousePosition) {
        return
      }

      const {
        dropPosition: nextDropPosition,
        dropLevelOffset: nextDropLevelOffset,
        dropTargetKey: nextDropTargetKey,
        dropContainerKey: nextDropContainerKey,
        dropTargetPos: nextDropTargetPos,
        dropAllowed: nextDropAllowed,
        dragOverNodeKey: nextDragOverNodeKey,
      } = calcDropPosition<any>(
        event,
        dragNodeProps as any,
        nodeProps as any,
        indent.value || 0,
        dragStartMousePosition,
        props.allowDrop as any,
        flattenNodes.value as any,
        keyEntities.value as any,
        expandedKeys.value,
        props.direction,
      )

      if (dragChildrenKeys.value.includes(nextDropTargetKey) || !nextDropAllowed) {
        return
      }

      if (dragNodeProps.eventKey === nextDropTargetKey && nextDropLevelOffset === 0) {
        if (
          !(
            dropPosition.value === null
            && dropLevelOffset.value === null
            && dropTargetKey.value === null
            && dropContainerKey.value === null
            && dropTargetPos.value === null
            && dropAllowed.value === false
            && dragOverNodeKey.value === null
          )
        ) {
          resetDragState()
        }
      }
      else if (
        !(
          nextDropPosition === dropPosition.value
          && nextDropLevelOffset === dropLevelOffset.value
          && nextDropTargetKey === dropTargetKey.value
          && nextDropContainerKey === dropContainerKey.value
          && nextDropTargetPos === dropTargetPos.value
          && nextDropAllowed === dropAllowed.value
          && nextDragOverNodeKey === dragOverNodeKey.value
        )
      ) {
        dropPosition.value = nextDropPosition
        dropLevelOffset.value = nextDropLevelOffset
        dropTargetKey.value = nextDropTargetKey
        dropContainerKey.value = nextDropContainerKey
        dropTargetPos.value = nextDropTargetPos
        dropAllowed.value = nextDropAllowed
        dragOverNodeKey.value = nextDragOverNodeKey
      }

      props.onDragOver?.({ event, node: convertNodePropsToEventData<any>(nodeProps as any) })
    }

    const onNodeDragLeave: NodeDragEventHandler<any> = (event, nodeProps) => {
      const target = event.currentTarget as any as Node | null
      const related = (event as any).relatedTarget as any as Node | null
      if (currentMouseOverDroppableNodeKey === nodeProps.eventKey && target && related && !target.contains(related)) {
        resetDragState()
        currentMouseOverDroppableNodeKey = null
      }
      else if (currentMouseOverDroppableNodeKey === nodeProps.eventKey && target && !related) {
        resetDragState()
        currentMouseOverDroppableNodeKey = null
      }

      props.onDragLeave?.({ event, node: convertNodePropsToEventData<any>(nodeProps as any) })
    }

    const onNodeDragEnd: NodeDragEventHandler<any> = (event, nodeProps, _outsideTree) => {
      dragOverNodeKey.value = null
      cleanDragState()
      if (nodeProps) {
        props.onDragEnd?.({ event, node: convertNodePropsToEventData<any>(nodeProps as any) })
      }
      dragNodeProps = null
      window.removeEventListener('dragend', onWindowDragEnd)
    }

    const onNodeDrop: NodeDragEventHandler<any> = (event, _nodeProps, outsideTree = false) => {
      if (!dropAllowed.value) {
        return
      }

      dragOverNodeKey.value = null
      cleanDragState()

      if (dropTargetKey.value === null) {
        return
      }

      const abstractDropNodeProps: any = {
        ...(getTreeNodeProps(dropTargetKey.value, getTreeNodeRequiredProps.value as any) as any),
        active: getActiveItem.value?.key === dropTargetKey.value,
        data: getEntity(keyEntities.value as any, dropTargetKey.value)?.node,
      }

      const dropToChild = dragChildrenKeys.value.includes(dropTargetKey.value)
      warning(
        !dropToChild,
        'Can not drop to dragNode\'s children node. This is a bug of rc-tree. Please report an issue.',
      )

      const posArr = posToArr(dropTargetPos.value || '0')
      const dropResult = {
        event,
        node: convertNodePropsToEventData<any>(abstractDropNodeProps),
        dragNode: dragNodeProps ? convertNodePropsToEventData<any>(dragNodeProps as any) : null,
        dragNodesKeys: dragNodeProps ? [dragNodeProps.eventKey!].concat(dragChildrenKeys.value) : dragChildrenKeys.value,
        dropToGap: dropPosition.value !== 0,
        dropPosition: (dropPosition.value || 0) + Number(posArr[posArr.length - 1]),
      }

      if (!outsideTree) {
        props.onDrop?.(dropResult)
      }

      dragNodeProps = null
    }

    const draggableConfig = computed(() => {
      if (!props.draggable) {
        return undefined
      }
      if (typeof props.draggable === 'object') {
        return props.draggable as DraggableConfig
      }
      if (typeof props.draggable === 'function') {
        return { nodeDraggable: props.draggable as any } satisfies DraggableConfig
      }
      return {} as DraggableConfig
    })

    const contextValue = reactive<TreeContextProps<any>>({
      prefixCls: props.prefixCls,
      selectable: props.selectable,
      showIcon: props.showIcon,
      icon: props.icon as any,
      switcherIcon: props.switcherIcon as any,
      draggable: draggableConfig.value,
      draggingNodeKey: draggingNodeKey.value,
      checkable: props.checkable,
      checkStrictly: props.checkStrictly,
      disabled: props.disabled,
      keyEntities: keyEntities.value,
      dropLevelOffset: dropLevelOffset.value,
      dropContainerKey: dropContainerKey.value,
      dropTargetKey: dropTargetKey.value,
      dropPosition: dropPosition.value,
      indent: indent.value,
      dropIndicatorRender: (diProps) => {
        if (props.dropIndicatorRender) {
          return props.dropIndicatorRender(diProps)
        }
        return (
          <DropIndicator
            dropPosition={diProps.dropPosition}
            dropLevelOffset={diProps.dropLevelOffset}
            indent={diProps.indent}
          />
        )
      },
      dragOverNodeKey: dragOverNodeKey.value,
      direction: props.direction,
      loadData: props.loadData,
      filterTreeNode: props.filterTreeNode,
      titleRender: props.titleRender,
      allowDrop: props.allowDrop as any,
      styles: props.styles as any,
      classNames: props.classNames as any,
      onNodeClick,
      onNodeDoubleClick,
      onNodeExpand,
      onNodeSelect,
      onNodeCheck,
      onNodeLoad,
      onNodeMouseEnter,
      onNodeMouseLeave,
      onNodeContextMenu,
      onNodeDragStart,
      onNodeDragEnter,
      onNodeDragOver,
      onNodeDragLeave,
      onNodeDragEnd,
      onNodeDrop,
    })

    watchEffect(() => {
      contextValue.prefixCls = props.prefixCls
      contextValue.selectable = props.selectable
      contextValue.showIcon = props.showIcon
      contextValue.icon = props.icon as any
      contextValue.switcherIcon = props.switcherIcon as any
      contextValue.draggable = draggableConfig.value
      contextValue.draggingNodeKey = draggingNodeKey.value
      contextValue.checkable = props.checkable
      contextValue.checkStrictly = props.checkStrictly
      contextValue.disabled = props.disabled
      contextValue.keyEntities = keyEntities.value
      contextValue.dropLevelOffset = dropLevelOffset.value
      contextValue.dropContainerKey = dropContainerKey.value
      contextValue.dropTargetKey = dropTargetKey.value
      contextValue.dropPosition = dropPosition.value
      contextValue.indent = indent.value
      contextValue.dragOverNodeKey = dragOverNodeKey.value
      contextValue.direction = props.direction
      contextValue.loadData = props.loadData
      contextValue.filterTreeNode = props.filterTreeNode
      contextValue.titleRender = props.titleRender
      contextValue.styles = props.styles as any
      contextValue.classNames = props.classNames as any
    })

    provide(TreeContextKey, contextValue)

    return () => {
      const domProps = pickAttrs(attrs, { aria: true, data: true })

      return (
        <div
          class={clsx(props.prefixCls, props.className, props.rootClassName, {
            [`${props.prefixCls}-show-line`]: props.showLine,
            [`${props.prefixCls}-focused`]: focused.value,
            [`${props.prefixCls}-active-focused`]: activeKey.value !== null,
          })}
          style={props.rootStyle}
        >
          <NodeList
            ref={listRef as any}
            prefixCls={props.prefixCls}
            style={props.style}
            data={flattenNodes.value}
            disabled={props.disabled}
            selectable={props.selectable}
            checkable={!!props.checkable}
            dragging={draggingNodeKey.value !== null}
            height={props.height}
            itemHeight={props.itemHeight}
            virtual={props.virtual}
            focusable={props.focusable}
            focused={focused.value}
            tabIndex={props.tabIndex}
            activeItem={getActiveItem.value}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            onActiveChange={onActiveChange}
            onContextmenu={props.onContextMenu as any}
            onScroll={props.onScroll as any}
            scrollWidth={props.scrollWidth}
            {...getTreeNodeRequiredProps.value}
            {...domProps}
          />
        </div>
      )
    }
  },
})

;(TreeNode as any) // keep treeNode tree-shaken
