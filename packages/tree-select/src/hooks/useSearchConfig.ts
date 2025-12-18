import type { Ref } from 'vue'
import type { SearchConfig } from '../TreeSelect'
import { computed } from 'vue'

export type SearchConfigResult = [Ref<boolean | undefined>, Ref<SearchConfig>]

// Convert `showSearch` to unique config
export default function useSearchConfig(
  showSearch: Ref<boolean | SearchConfig | undefined>,
  props: Ref<SearchConfig & { inputValue?: string }>,
): SearchConfigResult {
  const mergedShowSearch = computed<boolean | undefined>(() => {
    const isObject = typeof showSearch.value === 'object'
    return isObject ? true : showSearch.value as boolean | undefined
  })

  const searchConfig = computed<SearchConfig>(() => {
    const {
      searchValue,
      inputValue,
      onSearch,
      autoClearSearchValue,
      filterTreeNode,
      treeNodeFilterProp,
    } = props.value

    const isObject = typeof showSearch.value === 'object'

    return {
      searchValue: searchValue ?? inputValue,
      onSearch,
      autoClearSearchValue,
      filterTreeNode,
      treeNodeFilterProp,
      ...(isObject ? showSearch.value as SearchConfig : {}),
    }
  })

  return [mergedShowSearch, searchConfig]
}
