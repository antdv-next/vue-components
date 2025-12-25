import type { Ref } from 'vue'
import type {
  InternalValueType,
  LegacyKey,
  ShowCheckedStrategy,
  SingleValueType,
} from '../Cascader'
import type { GetEntities } from './useEntities'
import { conductCheck } from '@v-c/tree'
import { toPathKey, toPathKeys } from '../utils/commonUtil'
import { formatStrategyValues } from '../utils/treeUtil'

export default function useSelect(
  multiple: Ref<boolean>,
  triggerChange: (nextValues: InternalValueType) => void,
  checkedValues: Ref<SingleValueType[]>,
  halfCheckedValues: Ref<SingleValueType[]>,
  missingCheckedValues: Ref<SingleValueType[]>,
  getPathKeyEntities: GetEntities,
  getValueByKeyPath: (pathKeys: LegacyKey[]) => SingleValueType[],
  showCheckedStrategy?: Ref<ShowCheckedStrategy | undefined>,
) {
  return (valuePath: SingleValueType) => {
    if (!multiple.value) {
      triggerChange(valuePath)
    }
    else {
      // Prepare conduct required info
      const pathKey = toPathKey(valuePath)
      const checkedPathKeys = toPathKeys(checkedValues.value)
      const halfCheckedPathKeys = toPathKeys(halfCheckedValues.value)

      const existInChecked = checkedPathKeys.includes(pathKey)
      const existInMissing = missingCheckedValues.value.some(
        valueCells => toPathKey(valueCells) === pathKey,
      )

      // Do update
      let nextCheckedValues = checkedValues.value
      let nextMissingValues = missingCheckedValues.value

      if (existInMissing && !existInChecked) {
        // Missing value only do filter
        nextMissingValues = missingCheckedValues.value.filter(
          valueCells => toPathKey(valueCells) !== pathKey,
        )
      }
      else {
        // Update checked key first
        const nextRawCheckedKeys = existInChecked
          ? checkedPathKeys.filter(key => key !== pathKey)
          : [...checkedPathKeys, pathKey]

        const pathKeyEntities = getPathKeyEntities()

        // Conduction by selected or not
        let checkedKeys: LegacyKey[]
        if (existInChecked) {
          ;({ checkedKeys } = conductCheck(
            nextRawCheckedKeys,
            { checked: false, halfCheckedKeys: halfCheckedPathKeys },
            pathKeyEntities,
          ) as { checkedKeys: LegacyKey[] })
        }
        else {
          ;({ checkedKeys } = conductCheck(nextRawCheckedKeys, true, pathKeyEntities) as {
            checkedKeys: LegacyKey[]
          })
        }

        // Roll up to parent level keys
        const deDuplicatedKeys = formatStrategyValues(
          checkedKeys,
          getPathKeyEntities,
          showCheckedStrategy?.value,
        )
        nextCheckedValues = getValueByKeyPath(deDuplicatedKeys)
      }

      triggerChange([...nextMissingValues, ...nextCheckedValues])
    }
  }
}
