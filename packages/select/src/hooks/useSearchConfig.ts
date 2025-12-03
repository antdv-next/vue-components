import type { Ref } from 'vue'
import type { SearchConfig, SelectProps } from '../Select'
import { computed } from 'vue'

export type SearchConfigResult = [Ref<boolean | undefined>, Ref<SearchConfig>]

// Convert `showSearch` to unique config
export default function useSearchConfig(
  showSearch: Ref<boolean | SearchConfig | undefined>,
  props: {
    filterOption?: Ref<SelectProps['filterOption']>
    searchValue?: Ref<string | undefined>
    optionFilterProp?: Ref<string | undefined>
    filterSort?: Ref<SelectProps['filterSort']>
    onSearch?: Ref<((value: string) => void) | undefined>
    autoClearSearchValue?: Ref<boolean | undefined>
  },
  mode: Ref<SelectProps['mode']>,
): SearchConfigResult {
  const {
    filterOption,
    searchValue,
    optionFilterProp,
    filterSort,
    onSearch,
    autoClearSearchValue,
  } = props

  const mergedShowSearch = computed<boolean | undefined>(() => {
    const isObject = typeof showSearch.value === 'object'
    return (
      isObject
      || mode.value === 'combobox'
      || mode.value === 'tags'
      || (mode.value === 'multiple' && showSearch.value === undefined)
    )
      ? true
      : showSearch.value as boolean | undefined
  })

  const searchConfig = computed<SearchConfig>(() => {
    const isObject = typeof showSearch.value === 'object'
    return {
      filterOption: filterOption?.value,
      searchValue: searchValue?.value,
      optionFilterProp: optionFilterProp?.value,
      filterSort: filterSort?.value,
      onSearch: onSearch?.value,
      autoClearSearchValue: autoClearSearchValue?.value,
      ...(isObject ? showSearch.value as SearchConfig : {}),
    }
  })

  return [mergedShowSearch, searchConfig]
}
