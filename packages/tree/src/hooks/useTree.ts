import type { MaybeRefOrGetter } from 'vue'
import type {
  BasicDataNode,
  DataEntity,
  DataNode,
  FieldNames,
  Key,
  KeyEntities,
} from '../interface'
import { computed, toValue } from 'vue'
import getEntity from '../utils/keyUtil'
import { convertDataToEntities } from '../utils/treeUtil'

export interface UseTreeConfig {
  fieldNames?: MaybeRefOrGetter<FieldNames | undefined>
}

export interface TreeInstance<TreeDataType extends DataNode | BasicDataNode = DataNode> {
  getPath: (key: Key) => DataEntity<TreeDataType>[]
}

export default function useTree<TreeDataType extends DataNode | BasicDataNode = DataNode>(
  treeData: MaybeRefOrGetter<TreeDataType[]>,
  config: UseTreeConfig = {},
): TreeInstance<TreeDataType> {
  const { fieldNames } = config

  const keyEntities = computed(() => {
    const { keyEntities } = convertDataToEntities(toValue(treeData) as unknown as DataNode[], {
      fieldNames: toValue(fieldNames),
    })
    return keyEntities as KeyEntities<TreeDataType>
  })

  const getPath = (key: Key) => {
    const path: DataEntity<TreeDataType>[] = []
    let entity = getEntity(keyEntities.value, key)

    while (entity) {
      path.unshift(entity)
      entity = entity.parent!
    }

    return path
  }

  return { getPath }
}
