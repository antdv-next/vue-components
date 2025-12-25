import type { DataEntity } from '@v-c/tree'
import type { ComputedRef, Ref } from 'vue'
import type { LegacyKey, SingleValueType } from '../Cascader'
import type { GetMissValues } from './useMissingValues'
import { conductCheck } from '@v-c/tree'
import { computed } from 'vue'
import { toPathKeys } from '../utils/commonUtil'

export default function useValues(
  multiple: Ref<boolean>,
  rawValues: Ref<SingleValueType[]>,
  getPathKeyEntities: () => Record<string, DataEntity>,
  getValueByKeyPath: (pathKeys: LegacyKey[]) => SingleValueType[],
  getMissingValues: GetMissValues,
): ComputedRef<[
  checkedValues: SingleValueType[],
  halfCheckedValues: SingleValueType[],
  missingCheckedValues: SingleValueType[],
]> {
  // Fill `rawValues` with checked conduction values
  return computed(() => {
    const [existValues, missingValues] = getMissingValues(rawValues.value)

    if (!multiple.value || !rawValues.value.length) {
      return [existValues, [], missingValues]
    }

    const keyPathValues = toPathKeys(existValues)
    const keyPathEntities = getPathKeyEntities()

    const { checkedKeys, halfCheckedKeys } = conductCheck(keyPathValues, true, keyPathEntities) as {
      checkedKeys: LegacyKey[]
      halfCheckedKeys: LegacyKey[]
    }

    // Convert key back to value cells
    return [getValueByKeyPath(checkedKeys), getValueByKeyPath(halfCheckedKeys), missingValues]
  })
}
