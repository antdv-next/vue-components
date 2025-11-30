import type { MaybeRefOrGetter } from 'vue'
import type { DefaultOptionType, FieldNames, SelectProps } from '../Select'
import { computed, toValue } from 'vue'
import { toArray } from '../utils/commonUtil'
import { injectPropsWithOption } from '../utils/valueUtil'

function includes(test: any, search: string) {
  return toArray(test).join('').toUpperCase().includes(search)
}

export default (
  options: () => DefaultOptionType[],
  fieldNames: () => FieldNames,
  searchValue?: () => string,
  filterOption?: MaybeRefOrGetter<SelectProps['filterOption']>,
  optionFilterProp?: MaybeRefOrGetter<string | undefined>,
) =>
  computed(() => {
    const search = searchValue?.()
    const filterOptionValue = toValue(filterOption)
    const optionFilterPropValue = toValue(optionFilterProp)

    if (!search || filterOptionValue === false) {
      return options()
    }

    const {
      options: fieldOptions = 'options',
      label: fieldLabel = 'label',
      value: fieldValue = 'value',
    } = fieldNames()
    const filteredOptions: DefaultOptionType[] = []

    const customizeFilter = typeof filterOptionValue === 'function'

    const upperSearch = search.toUpperCase()
    const filterFunc = customizeFilter
      ? (filterOptionValue as any)
      : (_: string, option: DefaultOptionType) => {
          if (optionFilterPropValue) {
            return includes((option as any)[optionFilterPropValue], upperSearch)
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
      ? opt => injectPropsWithOption(opt)
      : opt => opt

    options().forEach((item) => {
      if ((item as any)[fieldOptions]) {
        const matchGroup = filterFunc(search, wrapOption(item))
        if (matchGroup) {
          filteredOptions.push(item)
        }
        else {
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
