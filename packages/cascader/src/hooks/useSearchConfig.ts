import type { Ref } from 'vue'
import type { CascaderProps, SearchConfig } from '../Cascader'
import { warning } from '@v-c/util'
import { computed } from 'vue'

export type SearchConfigResult = [Ref<boolean>, Ref<SearchConfig>]

// Convert `showSearch` to unique config
export default function useSearchConfig(
  showSearch: Ref<CascaderProps['showSearch']>,
  props: Ref<Pick<CascaderProps, 'autoClearSearchValue' | 'searchValue' | 'onSearch'>>,
): SearchConfigResult {
  const mergedShowSearch = computed<boolean>(() => {
    if (!showSearch.value) {
      return false
    }
    return typeof showSearch.value === 'object' ? true : !!showSearch.value
  })

  const searchConfig = computed<SearchConfig>(() => {
    if (!mergedShowSearch.value) {
      return {}
    }

    const { autoClearSearchValue, searchValue, onSearch } = props.value

    let config: SearchConfig = {
      matchInputWidth: true,
      limit: 50,
      autoClearSearchValue,
      searchValue,
      onSearch,
    }

    if (showSearch.value && typeof showSearch.value === 'object') {
      config = {
        ...config,
        ...showSearch.value,
      }
    }

    if ((config.limit as number) <= 0) {
      config.limit = false

      if (process.env.NODE_ENV !== 'production') {
        warning(false, '\'limit\' of showSearch should be positive number or false.')
      }
    }

    return config
  })

  return [mergedShowSearch, searchConfig]
}
