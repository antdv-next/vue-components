import type {
  BasicDataNode,
  DataEntity,
  DataNode,
  GetCheckDisabled,
  Key,
  KeyEntities,
} from '../interface'
import warning from '@v-c/util/dist/warning'
import getEntity from './keyUtil'

interface ConductReturnType {
  checkedKeys: Key[]
  halfCheckedKeys: Key[]
}

function removeFromCheckedKeys(halfCheckedKeys: Set<Key>, checkedKeys: Set<Key>) {
  const filteredKeys = new Set<Key>()
  halfCheckedKeys.forEach((key) => {
    if (!checkedKeys.has(key)) {
      filteredKeys.add(key)
    }
  })
  return filteredKeys
}

export function isCheckDisabled<TreeDataType>(node: TreeDataType) {
  const { disabled, disableCheckbox, checkable } = (node || {}) as DataNode
  return !!(disabled || disableCheckbox) || checkable === false
}

function fillConductCheck<TreeDataType extends BasicDataNode = DataNode>(
  keys: Set<Key>,
  levelEntities: Map<number, Set<DataEntity<TreeDataType>>>,
  maxLevel: number,
  syntheticGetCheckDisabled: GetCheckDisabled<TreeDataType>,
): ConductReturnType {
  const checkedKeys = new Set<Key>(keys)
  const halfCheckedKeys = new Set<Key>()

  for (let level = 0; level <= maxLevel; level += 1) {
    const entities = levelEntities.get(level) || new Set()
    entities.forEach((entity) => {
      const { key, node, children = [] } = entity

      if (checkedKeys.has(key) && !syntheticGetCheckDisabled(node)) {
        children
          .filter(childEntity => !syntheticGetCheckDisabled(childEntity.node))
          .forEach((childEntity) => {
            checkedKeys.add(childEntity.key)
          })
      }
    })
  }

  const visitedKeys = new Set<Key>()
  for (let level = maxLevel; level >= 0; level -= 1) {
    const entities = levelEntities.get(level) || new Set()
    entities.forEach((entity) => {
      const { parent, node } = entity

      if (syntheticGetCheckDisabled(node) || !entity.parent || visitedKeys.has(entity.parent.key)) {
        return
      }

      if (syntheticGetCheckDisabled(entity.parent.node)) {
        visitedKeys.add(parent!.key)
        return
      }

      let allChecked = true
      let partialChecked = false

      ;(parent!.children || [])
        .filter(childEntity => !syntheticGetCheckDisabled(childEntity.node))
        .forEach(({ key }) => {
          const checked = checkedKeys.has(key)
          if (allChecked && !checked) {
            allChecked = false
          }
          if (!partialChecked && (checked || halfCheckedKeys.has(key))) {
            partialChecked = true
          }
        })

      if (allChecked) {
        checkedKeys.add(parent!.key)
      }
      if (partialChecked) {
        halfCheckedKeys.add(parent!.key)
      }

      visitedKeys.add(parent!.key)
    })
  }

  return {
    checkedKeys: Array.from(checkedKeys),
    halfCheckedKeys: Array.from(removeFromCheckedKeys(halfCheckedKeys, checkedKeys)),
  }
}

function cleanConductCheck<TreeDataType extends BasicDataNode = DataNode>(
  keys: Set<Key>,
  halfKeys: Key[],
  levelEntities: Map<number, Set<DataEntity<TreeDataType>>>,
  maxLevel: number,
  syntheticGetCheckDisabled: GetCheckDisabled<TreeDataType>,
): ConductReturnType {
  const checkedKeys = new Set<Key>(keys)
  let halfCheckedKeys = new Set<Key>(halfKeys)

  for (let level = 0; level <= maxLevel; level += 1) {
    const entities = levelEntities.get(level) || new Set()
    entities.forEach((entity) => {
      const { key, node, children = [] } = entity

      if (!checkedKeys.has(key) && !halfCheckedKeys.has(key) && !syntheticGetCheckDisabled(node)) {
        children
          .filter(childEntity => !syntheticGetCheckDisabled(childEntity.node))
          .forEach((childEntity) => {
            checkedKeys.delete(childEntity.key)
          })
      }
    })
  }

  halfCheckedKeys = new Set<Key>()
  const visitedKeys = new Set<Key>()
  for (let level = maxLevel; level >= 0; level -= 1) {
    const entities = levelEntities.get(level) || new Set()

    entities.forEach((entity) => {
      const { parent, node } = entity

      if (syntheticGetCheckDisabled(node) || !entity.parent || visitedKeys.has(entity.parent.key)) {
        return
      }

      if (syntheticGetCheckDisabled(entity.parent.node)) {
        visitedKeys.add(parent!.key)
        return
      }

      let allChecked = true
      let partialChecked = false

      ;(parent!.children || [])
        .filter(childEntity => !syntheticGetCheckDisabled(childEntity.node))
        .forEach(({ key }) => {
          const checked = checkedKeys.has(key)
          if (allChecked && !checked) {
            allChecked = false
          }
          if (!partialChecked && (checked || halfCheckedKeys.has(key))) {
            partialChecked = true
          }
        })

      if (!allChecked) {
        checkedKeys.delete(parent!.key)
      }
      if (partialChecked) {
        halfCheckedKeys.add(parent!.key)
      }

      visitedKeys.add(parent!.key)
    })
  }

  return {
    checkedKeys: Array.from(checkedKeys),
    halfCheckedKeys: Array.from(removeFromCheckedKeys(halfCheckedKeys, checkedKeys)),
  }
}

export function conductCheck<TreeDataType extends BasicDataNode = DataNode>(
  keyList: Key[],
  checked: true | { checked: false, halfCheckedKeys: Key[] },
  keyEntities: KeyEntities<TreeDataType>,
  getCheckDisabled?: GetCheckDisabled<TreeDataType>,
): ConductReturnType {
  const warningMissKeys: Key[] = []

  const syntheticGetCheckDisabled = getCheckDisabled || isCheckDisabled

  const keys = new Set<Key>(
    (keyList || []).filter((key) => {
      const hasEntity = !!getEntity(keyEntities, key)
      if (!hasEntity) {
        warningMissKeys.push(key)
      }
      return hasEntity
    }),
  )

  const levelEntities = new Map<number, Set<DataEntity<TreeDataType>>>()
  let maxLevel = 0

  Object.keys(keyEntities).forEach((entityKey) => {
    const entity = keyEntities[entityKey]
    const { level } = entity

    let levelSet = levelEntities.get(level)
    if (!levelSet) {
      levelSet = new Set()
      levelEntities.set(level, levelSet)
    }

    levelSet.add(entity)
    maxLevel = Math.max(maxLevel, level)
  })

  warning(
    !warningMissKeys.length,
    `Tree missing follow keys: ${warningMissKeys
      .slice(0, 100)
      .map(key => `'${key}'`)
      .join(', ')}`,
  )

  if (checked === true) {
    return fillConductCheck<TreeDataType>(keys, levelEntities, maxLevel, syntheticGetCheckDisabled)
  }

  return cleanConductCheck(keys, checked.halfCheckedKeys, levelEntities, maxLevel, syntheticGetCheckDisabled)
}
