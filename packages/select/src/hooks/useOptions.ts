import type { DefaultOptionType, FieldNames, RawValueType } from '../Select'
import { computed } from 'vue'
import { convertChildrenToData } from '../utils/legacyUtil'

function useOptions<OptionType = DefaultOptionType>(options: () => OptionType[], children: () => any, fieldNames: () => FieldNames, optionFilterProp: () => string, optionLabelProp: () => string) {
  return computed(() => {
    let mergedOptions = options()
    const childrenAsData = !mergedOptions

    if (childrenAsData) {
      mergedOptions = convertChildrenToData(children()) as any
    }

    const valueOptions = new Map<RawValueType, OptionType>()
    const labelOptions = new Map<any, OptionType>()

    const setLabelOptions = (
      labelOptionsMap: Map<any, OptionType>,
      option: OptionType,
      key: string | number,
    ) => {
      if (key && typeof key === 'string') {
        labelOptionsMap.set((option as any)[key], option)
      }
    }

    const mergedFieldNames = {
      value: fieldNames()?.value || 'value',
      label: fieldNames()?.label || 'label',
      options: fieldNames()?.options || 'options',
    }
    const optionFilterPropVal = optionFilterProp() as any
    const optionLabelPropVal = optionLabelProp() as any

    const dig = (optionList: OptionType[], isChildren = false) => {
      if (!Array.isArray(optionList))
        return
      for (let i = 0; i < optionList.length; i += 1) {
        const option = optionList[i]
        if (!(option as any)[mergedFieldNames.options] || isChildren) {
          valueOptions.set((option as any)[mergedFieldNames.value], option)
          setLabelOptions(labelOptions, option, mergedFieldNames.label)
          setLabelOptions(labelOptions, option, optionFilterPropVal)
          setLabelOptions(labelOptions, option, optionLabelPropVal)
        }
        else {
          dig((option as any)[mergedFieldNames.options], true)
        }
      }
    }

    dig(mergedOptions)

    return {
      options: mergedOptions,
      valueOptions,
      labelOptions,
    }
  })
}

export default useOptions
