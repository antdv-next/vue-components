import type {
  BasicDataNode,
  DataEntity,
  DataNode,
  Direction,
  FlattenNode,
  Key,
  KeyEntities,
  TreeNodeProps,
} from './interface'
import warning from '@v-c/util/dist/warning'
import getEntity from './utils/keyUtil'

export interface AllowDropOptions<TreeDataType extends BasicDataNode = DataNode> {
  dragNode: TreeDataType
  dropNode: TreeDataType
  dropPosition: -1 | 0 | 1
}

export type AllowDrop<TreeDataType extends BasicDataNode = DataNode> = (
  options: AllowDropOptions<TreeDataType>,
) => boolean

export function arrDel(list: Key[], value: Key) {
  if (!list)
    return []
  const clone = list.slice()
  const index = clone.indexOf(value)
  if (index >= 0) {
    clone.splice(index, 1)
  }
  return clone
}

export function arrAdd(list: Key[], value: Key) {
  const clone = (list || []).slice()
  if (!clone.includes(value)) {
    clone.push(value)
  }
  return clone
}

export function posToArr(pos: string) {
  return pos.split('-')
}

export function getDragChildrenKeys<TreeDataType extends BasicDataNode = DataNode>(
  dragNodeKey: Key,
  keyEntities: KeyEntities<TreeDataType>,
): Key[] {
  const dragChildrenKeys: Key[] = []
  const entity = getEntity(keyEntities, dragNodeKey)

  function dig(list: DataEntity<TreeDataType>[] = []) {
    list.forEach(({ key, children }) => {
      dragChildrenKeys.push(key)
      dig(children)
    })
  }

  dig(entity?.children)

  return dragChildrenKeys
}

export function isLastChild<TreeDataType extends BasicDataNode = DataNode>(
  treeNodeEntity: DataEntity<TreeDataType>,
) {
  if (treeNodeEntity.parent) {
    const posArr = posToArr(treeNodeEntity.pos)
    return Number(posArr[posArr.length - 1]) === (treeNodeEntity.parent.children || []).length - 1
  }
  return false
}

export function isFirstChild<TreeDataType extends BasicDataNode = DataNode>(
  treeNodeEntity: DataEntity<TreeDataType>,
) {
  const posArr = posToArr(treeNodeEntity.pos)
  return Number(posArr[posArr.length - 1]) === 0
}

export function calcDropPosition<TreeDataType extends BasicDataNode = DataNode>(
  event: MouseEvent,
  dragNodeProps: TreeNodeProps<TreeDataType>,
  targetNodeProps: TreeNodeProps<TreeDataType>,
  indent: number,
  startMousePosition: { x: number, y: number },
  allowDrop: AllowDrop<TreeDataType>,
  flattenedNodes: FlattenNode<TreeDataType>[],
  keyEntities: KeyEntities<TreeDataType>,
  expandKeys: Key[],
  direction: Direction,
): {
  dropPosition: -1 | 0 | 1
  dropLevelOffset: number
  dropTargetKey: Key
  dropTargetPos: string
  dropContainerKey: Key | null
  dragOverNodeKey: Key
  dropAllowed: boolean
} {
  const { clientX, clientY } = event
  const { top, height } = (event.target as HTMLElement).getBoundingClientRect()

  const rawDropLevelOffset = (((direction === 'rtl' ? -1 : 1) * ((startMousePosition?.x || 0) - clientX) - 12) / indent)

  const filteredExpandKeys = expandKeys.filter(
    key => (getEntity(keyEntities, key)?.children || []).length,
  )

  let abstractDropNodeEntity = getEntity(keyEntities, targetNodeProps.eventKey!)
  if (clientY < top + height / 2) {
    const nodeIndex = flattenedNodes.findIndex(({ key }) => key === abstractDropNodeEntity.key)
    const prevNodeKey = flattenedNodes[nodeIndex <= 0 ? 0 : nodeIndex - 1].key
    abstractDropNodeEntity = getEntity(keyEntities, prevNodeKey)
  }

  const initialAbstractDropNodeKey = abstractDropNodeEntity.key
  const abstractDragOverEntity = abstractDropNodeEntity
  const dragOverNodeKey = abstractDropNodeEntity.key

  let dropPosition: -1 | 0 | 1 = 0
  let dropLevelOffset = 0

  if (!filteredExpandKeys.includes(initialAbstractDropNodeKey)) {
    for (let i = 0; i < rawDropLevelOffset; i += 1) {
      if (isLastChild(abstractDropNodeEntity)) {
        abstractDropNodeEntity = abstractDropNodeEntity.parent!
        dropLevelOffset += 1
      }
      else {
        break
      }
    }
  }

  const abstractDragDataNode = dragNodeProps.data!
  const abstractDropDataNode = abstractDropNodeEntity.node
  let dropAllowed = true

  if (
    isFirstChild(abstractDropNodeEntity)
    && abstractDropNodeEntity.level === 0
    && clientY < top + height / 2
    && allowDrop({
      dragNode: abstractDragDataNode,
      dropNode: abstractDropDataNode,
      dropPosition: -1,
    })
    && abstractDropNodeEntity.key === targetNodeProps.eventKey
  ) {
    dropPosition = -1
  }
  else if (
    (abstractDragOverEntity.children || []).length
    && filteredExpandKeys.includes(dragOverNodeKey)
  ) {
    if (
      allowDrop({
        dragNode: abstractDragDataNode,
        dropNode: abstractDropDataNode,
        dropPosition: 0,
      })
    ) {
      dropPosition = 0
    }
    else {
      dropAllowed = false
    }
  }
  else if (dropLevelOffset === 0) {
    if (rawDropLevelOffset > -1.5) {
      if (
        allowDrop({
          dragNode: abstractDragDataNode,
          dropNode: abstractDropDataNode,
          dropPosition: 1,
        })
      ) {
        dropPosition = 1
      }
      else {
        dropAllowed = false
      }
    }
    else if (
      allowDrop({
        dragNode: abstractDragDataNode,
        dropNode: abstractDropDataNode,
        dropPosition: 0,
      })
    ) {
      dropPosition = 0
    }
    else if (
      allowDrop({
        dragNode: abstractDragDataNode,
        dropNode: abstractDropDataNode,
        dropPosition: 1,
      })
    ) {
      dropPosition = 1
    }
    else {
      dropAllowed = false
    }
  }
  else if (
    allowDrop({
      dragNode: abstractDragDataNode,
      dropNode: abstractDropDataNode,
      dropPosition: 1,
    })
  ) {
    dropPosition = 1
  }
  else {
    dropAllowed = false
  }

  return {
    dropPosition,
    dropLevelOffset,
    dropTargetKey: abstractDropNodeEntity.key,
    dropTargetPos: abstractDropNodeEntity.pos,
    dragOverNodeKey,
    dropContainerKey: dropPosition === 0 ? null : abstractDropNodeEntity.parent?.key || null,
    dropAllowed,
  }
}

export function calcSelectedKeys(selectedKeys: Key[], { multiple }: { multiple?: boolean }) {
  if (!selectedKeys)
    return undefined

  if (multiple) {
    return selectedKeys.slice()
  }

  if (selectedKeys.length) {
    return [selectedKeys[0]]
  }
  return selectedKeys
}

export function parseCheckedKeys(keys: Key[] | { checked: Key[], halfChecked: Key[] }) {
  if (!keys) {
    return null
  }

  let keyProps: { checkedKeys?: Key[], halfCheckedKeys?: Key[] }
  if (Array.isArray(keys)) {
    keyProps = {
      checkedKeys: keys,
      halfCheckedKeys: undefined,
    }
  }
  else if (typeof keys === 'object') {
    keyProps = {
      checkedKeys: keys.checked || undefined,
      halfCheckedKeys: keys.halfChecked || undefined,
    }
  }
  else {
    warning(false, '`checkedKeys` is not an array or an object')
    return null
  }

  return keyProps
}

export function conductExpandParent(keyList: Key[], keyEntities: KeyEntities): Key[] {
  const expandedKeys = new Set<Key>()

  function conductUp(key: Key) {
    if (expandedKeys.has(key))
      return

    const entity = getEntity(keyEntities, key)
    if (!entity)
      return

    expandedKeys.add(key)

    const { parent, node } = entity

    if (node.disabled)
      return

    if (parent) {
      conductUp(parent.key)
    }
  }

  ;(keyList || []).forEach((key) => {
    conductUp(key)
  })

  return [...expandedKeys]
}
