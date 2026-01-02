import type { DataEntity, DataNode } from '@v-c/tree'
import type { Ref } from 'vue'
import type { DefaultOptionType, InternalFieldNames } from '../Cascader'
import { convertDataToEntities } from '@v-c/tree'
import { shallowRef } from 'vue'
import { VALUE_SPLIT } from '../utils/commonUtil'

export interface OptionsInfo {
  keyEntities: Record<string, DataEntity>
  pathKeyEntities: Record<string, DataEntity>
}

export type GetEntities = () => OptionsInfo['pathKeyEntities']

/** Lazy parse options data into conduct-able info to avoid perf issue in single mode */
export default function useEntities(
  options: Ref<DefaultOptionType[]>,
  fieldNames: Ref<InternalFieldNames>,
) {
  const cacheRef = shallowRef<{
    options: DefaultOptionType[]
    fieldNames: InternalFieldNames | null
    info: OptionsInfo
  }>({
    options: [],
    fieldNames: null,
    info: { keyEntities: {}, pathKeyEntities: {} },
  })

  const getEntities: GetEntities = () => {
    const mergedOptions = options.value
    const mergedFieldNames = fieldNames.value
    if (cacheRef.value.options !== mergedOptions || cacheRef.value.fieldNames !== mergedFieldNames) {
      cacheRef.value.options = mergedOptions
      cacheRef.value.fieldNames = mergedFieldNames
      cacheRef.value.info = convertDataToEntities(mergedOptions as DataNode[], {
        fieldNames: mergedFieldNames as any,
        initWrapper: wrapper => ({
          ...wrapper,
          pathKeyEntities: {},
        }),
        processEntity: (entity, wrapper) => {
          const pathKey = (entity.nodes as DefaultOptionType[])
            .map(node => (node as any)[mergedFieldNames.value])
            .join(VALUE_SPLIT)

          ;(wrapper as unknown as OptionsInfo).pathKeyEntities[pathKey] = entity

          // Overwrite origin key.
          // this is very hack but we need let conduct logic work with connect path
          entity.key = pathKey
        },
      }) as any
    }

    return cacheRef.value.info.pathKeyEntities
  }

  return getEntities
}
