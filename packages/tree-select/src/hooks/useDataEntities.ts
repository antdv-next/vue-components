import type { DataEntity, KeyEntities } from '@v-c/tree'
import type { Ref } from 'vue'
import type { DataNode, FieldNames, SafeKey } from '../interface'
import { warning } from '@v-c/util'
import { convertDataToEntities } from '@v-c/tree'
import { shallowRef, watchEffect } from 'vue'
import { isNil } from '../utils/valueUtil'

export default function useDataEntities(
  treeData: Ref<DataNode[]>,
  fieldNames: Ref<FieldNames>,
): {
  valueEntities: Ref<Map<SafeKey, DataEntity>>
  keyEntities: Ref<KeyEntities>
} {
  const valueEntities = shallowRef<Map<SafeKey, DataEntity>>(new Map())
  const keyEntities = shallowRef<KeyEntities>({})

  watchEffect(() => {
    const mergedFieldNames = fieldNames.value as any

    const collection = convertDataToEntities(treeData.value as any, {
      fieldNames: mergedFieldNames,
      initWrapper: (wrapper: any) => ({
        ...wrapper,
        valueEntities: new Map(),
      }),
      processEntity: (entity: DataEntity, wrapper: any) => {
        const val = (entity.node as any)[mergedFieldNames.value]

        // Check if exist same value
        if (process.env.NODE_ENV !== 'production') {
          const key = (entity.node as any).key

          warning(!isNil(val), 'TreeNode `value` is invalidate: undefined')
          warning(!wrapper.valueEntities.has(val), `Same \`value\` exist in the tree: ${val}`)
          warning(
            !key || String(key) === String(val),
            `\`key\` or \`value\` with TreeNode must be the same or you can remove one of them. key: ${key}, value: ${val}.`,
          )
        }

        wrapper.valueEntities.set(val, entity)
      },
    }) as any

    keyEntities.value = collection.keyEntities
    valueEntities.value = collection.valueEntities
  })

  return {
    valueEntities,
    keyEntities,
  }
}
