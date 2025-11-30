import { computed } from 'vue'
import { toArray } from '../utils/commonUtil'
import type { DefaultOptionType, FieldNames, SelectProps } from '../Select'
import { injectPropsWithOption } from '../utils/valueUtil'

function includes(test: any, search: string) {
  return toArray(test).join('').toUpperCase().includes(search)
}

export default (
  options: () => DefaultOptionType[],
  fieldNames: () => FieldNames,
  searchValue?: () => string,
  filterOption?: SelectProps['filterOption'],
  optionFilterProp?: string,
) =>
  computed(() => {
    const search = searchValue?.()
    if (!search || filterOption === false) {
      return options()
    }

    const {
      options: fieldOptions = 'options',
      label: fieldLabel = 'label',
      value: fieldValue = 'value',
    } = fieldNames()
    const filteredOptions: DefaultOptionType[] = []

    const customizeFilter = typeof filterOption === 'function'

    const upperSearch = search.toUpperCase()
    const filterFunc = customizeFilter
      ? (filterOption as any)
      : (_: string, option: DefaultOptionType) => {
          if (optionFilterProp) {
            return includes((option as any)[optionFilterProp], upperSearch)
          }

          if ((option as any)[fieldOptions]) {
            return includes(
              (option as any)[fieldLabel !== 'children' ? fieldLabel : 'label'],
              upperSearch,
            )
          }

          return includes((option as any)[fieldValue], upperSearch)
        }

    const wrapOption: (opt: DefaultOptionType) => DefaultOptionType = customizeFilter
      ? (opt) => injectPropsWithOption(opt)
      : (opt) => opt

    options().forEach((item) => {
      if ((item as any)[fieldOptions]) {
        const matchGroup = filterFunc(search, wrapOption(item))
        if (matchGroup) {
          filteredOptions.push(item)
        } else {
          const subOptions = (item as any)[fieldOptions].filter((subItem: DefaultOptionType) =>
            filterFunc(search, wrapOption(subItem)),
          )
          if (subOptions.length) {
            filteredOptions.push({
              ...item,
              [fieldOptions]: subOptions,
            } as DefaultOptionType)
          }
        }

        return
      }

      if (filterFunc(search, wrapOption(item))) {
        filteredOptions.push(item)
      }
    })

    return filteredOptions
  })
