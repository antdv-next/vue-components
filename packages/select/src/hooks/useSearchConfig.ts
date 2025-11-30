import type { DefaultOptionType, SearchConfig, SelectProps } from '../Select'
import { computed } from 'vue'

export default function useSearchConfig(
  showSearch: () => boolean | SearchConfig<DefaultOptionType> | undefined,
  props: () => SearchConfig<DefaultOptionType>,
  mode: () => SelectProps<DefaultOptionType>['mode'],
) {
  return computed(() => {
    const currentShowSearch = showSearch()
    const isObject = typeof currentShowSearch === 'object'
    const {
      filterOption,
      searchValue,
      optionFilterProp,
      filterSort,
      onSearch,
      autoClearSearchValue,
    } = props()

    const searchConfig = {
      filterOption,
      searchValue,
      optionFilterProp,
      filterSort,
      onSearch,
      autoClearSearchValue,
      ...(isObject ? (currentShowSearch as any) : {}),
    }

    return [
      isObject
      || mode() === 'combobox'
      || mode() === 'tags'
      || (mode() === 'multiple' && currentShowSearch === undefined)
        ? true
        : currentShowSearch,
      searchConfig,
    ] as [boolean | undefined, SearchConfig<DefaultOptionType>]
  })
}
