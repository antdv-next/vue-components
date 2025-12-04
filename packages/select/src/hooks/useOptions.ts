import type { VueNode } from '@v-c/util/dist/type'
import type { Ref } from 'vue'
import type { RawValueType } from '../interface'
import type { DefaultOptionType, FieldNames } from '../Select'
import { computed } from 'vue'

export interface OptionsResult<OptionType> {
  options: OptionType[]
  valueOptions: Map<RawValueType, OptionType>
  labelOptions: Map<VueNode, OptionType>
}

/**
 * Parse `options` and flatten them.
 */
export default function useOptions<OptionType extends DefaultOptionType = DefaultOptionType>(
  options: Ref<OptionType[] | undefined>,
  childrenOptions: Ref<any[]>,
  fieldNames: Ref<FieldNames>,
  optionFilterProp: Ref<string | undefined>,
  optionLabelProp: Ref<string | undefined>,
): Ref<OptionsResult<OptionType>> {
  return computed<OptionsResult<OptionType>>(() => {
    // Get children from slots and convert to data
    let mergedOptions: OptionType[] = []

    if (options.value && options.value.length > 0) {
      mergedOptions = options.value
    }
    else if (childrenOptions.value && childrenOptions.value.length > 0) {
      mergedOptions = childrenOptions.value
    }

    const valueOptions = new Map<RawValueType, OptionType>()
    const labelOptions = new Map<VueNode, OptionType>()

    const setLabelOptions = (
      labelOptionsMap: Map<VueNode, OptionType>,
      option: OptionType,
      key?: string,
    ) => {
      if (key && typeof key === 'string') {
        labelOptionsMap.set(option[key], option)
      }
    }

    const dig = (optionList: OptionType[], isChildren = false) => {
      if (!Array.isArray(optionList)) {
        return
      }
      // for loop to speed up collection speed
      for (let i = 0; i < optionList.length; i += 1) {
        const option = optionList[i]
        if (!option) {
          continue
        }
        const optionsKey = fieldNames.value?.options || 'options'
        const valueKey = fieldNames.value?.value || 'value'
        const labelKey = fieldNames.value?.label || 'label'

        if (!option[optionsKey] || isChildren) {
          valueOptions.set(option[valueKey] as RawValueType, option)
          setLabelOptions(labelOptions, option, labelKey)
          // https://github.com/ant-design/ant-design/issues/35304
          setLabelOptions(labelOptions, option, optionFilterProp.value)
          setLabelOptions(labelOptions, option, optionLabelProp.value)
        }
        else {
          dig(option[optionsKey] as OptionType[], true)
        }
      }
    }

    dig(mergedOptions)
    console.log(labelOptions.size, valueOptions.size)

    return {
      options: mergedOptions,
      valueOptions,
      labelOptions,
    }
  })
}
