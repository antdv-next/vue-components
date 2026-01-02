import type { Ref } from 'vue'
import type { DefaultOptionType, InternalFieldNames, SingleValueType } from '../Cascader'
import { toPathOptions } from '../utils/treeUtil'

export type GetMissValues = ReturnType<typeof useMissingValues>

export default function useMissingValues(
  options: Ref<DefaultOptionType[]>,
  fieldNames: Ref<InternalFieldNames>,
) {
  return (rawValues: SingleValueType[]): [SingleValueType[], SingleValueType[]] => {
    const missingValues: SingleValueType[] = []
    const existsValues: SingleValueType[] = []

    rawValues.forEach((valueCell) => {
      const pathOptions = toPathOptions(valueCell, options.value, fieldNames.value)
      if (pathOptions.every(opt => opt.option)) {
        existsValues.push(valueCell)
      }
      else {
        missingValues.push(valueCell)
      }
    })

    return [existsValues, missingValues]
  }
}
