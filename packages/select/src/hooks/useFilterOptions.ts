import type { VueNode } from '@v-c/util/dist/type'
import type { Ref } from 'vue'
import type { DefaultOptionType, FieldNames, FilterFunc, SelectProps } from '../Select'
import { computed } from 'vue'
import { injectPropsWithOption, toArray } from '../utils/commonUtil'

function includes(test: VueNode, search: string): boolean {
  return toArray(test).join('').toUpperCase().includes(search)
}

export default function useFilterOptions(
  options: Ref<DefaultOptionType[]>,
  fieldNames: Ref<FieldNames>,
  searchValue: Ref<string | undefined>,
  filterOption: Ref<SelectProps['filterOption']>,
  optionFilterProp: Ref<string | undefined>,
) {
  return computed<DefaultOptionType[]>(() => {
    if (!searchValue.value || filterOption.value === false) {
      return options.value
    }

    const {
      options: fieldOptions,
      label: fieldLabel,
      value: fieldValue,
    } = fieldNames.value

    const filteredOptions: DefaultOptionType[] = []
    const customizeFilter = typeof filterOption.value === 'function'
    const upperSearch = searchValue.value.toUpperCase()

    const defaultFilter: FilterFunc = (_: string, option?: DefaultOptionType) => {
      // Use provided `optionFilterProp`
      if (optionFilterProp.value && option) {
        return includes(option[optionFilterProp.value], upperSearch)
      }

      // Auto select `label` or `value` by option type
      if (option && option[fieldOptions!]) {
        // hack `fieldLabel` since `OptionGroup` children is not `label`
        return includes(option[fieldLabel !== 'children' ? fieldLabel! : 'label'], upperSearch)
      }

      return option ? includes(option[fieldValue!], upperSearch) : false
    }

    const filterFunc: FilterFunc = customizeFilter
      ? (filterOption.value as FilterFunc)
      : defaultFilter

    const wrapOption: (opt: DefaultOptionType) => DefaultOptionType = customizeFilter
      ? opt => injectPropsWithOption(opt)
      : opt => opt

    options.value.forEach((item) => {
      // Group should check child options
      if (item[fieldOptions!]) {
        // Check group first
        const matchGroup = filterFunc(searchValue.value!, wrapOption(item))
        if (matchGroup) {
          filteredOptions.push(item)
        }
        else {
          // Check option
          const subOptions = (item[fieldOptions!] as DefaultOptionType[]).filter(
            (subItem: DefaultOptionType) => filterFunc(searchValue.value!, wrapOption(subItem)),
          )
          if (subOptions.length) {
            filteredOptions.push({
              ...item,
              [fieldOptions!]: subOptions,
            })
          }
        }

        return
      }

      if (filterFunc(searchValue.value!, wrapOption(item))) {
        filteredOptions.push(item)
      }
    })

    return filteredOptions
  })
}
