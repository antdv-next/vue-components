import type { Ref } from 'vue'
import type { DefaultOptionType } from '..'
import type { InternalFieldNames, LegacyKey, SingleValueType } from '../Cascader'
import type { GetEntities } from './useEntities'
import { computed } from 'vue'
import useEntities from './useEntities'

export default function useOptions(
  mergedFieldNames: Ref<InternalFieldNames>,
  options: Ref<DefaultOptionType[] | undefined>,
): [
  mergedOptions: Ref<DefaultOptionType[]>,
  getPathKeyEntities: GetEntities,
  getValueByKeyPath: (pathKeys: LegacyKey[]) => SingleValueType[],
] {
  const emptyOptions: DefaultOptionType[] = []
  const mergedOptions = computed(() => options.value || emptyOptions)

  // Only used in multiple mode, this fn will not call in single mode
  const getPathKeyEntities = useEntities(mergedOptions, mergedFieldNames)

  /** Convert path key back to value format */
  const getValueByKeyPath = (pathKeys: LegacyKey[]): SingleValueType[] => {
    const keyPathEntities = getPathKeyEntities()

    return pathKeys.map((pathKey) => {
      const { nodes } = keyPathEntities[pathKey]

      return nodes.map(node => (node as Record<string, any>)[mergedFieldNames.value.value])
    })
  }

  return [mergedOptions, getPathKeyEntities, getValueByKeyPath]
}
